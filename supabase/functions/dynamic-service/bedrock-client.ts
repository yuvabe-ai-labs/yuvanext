// supabase/functions/nova-sonic/bedrock-client.ts

import {
  BedrockRuntimeClient,
  InvokeModelWithBidirectionalStreamCommand,
} from "npm:@aws-sdk/client-bedrock-runtime@3.x";

interface InferenceConfig {
  maxTokens: number;
  topP: number;
  temperature: number;
}

interface AudioConfiguration {
  audioType: "SPEECH";
  mediaType: "audio/lpcm";
  sampleRateHertz: number;
  sampleSizeBits: number;
  channelCount: number;
  encoding: string;
  voiceId?: string;
}

const DefaultAudioInputConfiguration: AudioConfiguration = {
  audioType: "SPEECH",
  mediaType: "audio/lpcm",
  sampleRateHertz: 16000,
  sampleSizeBits: 16,
  channelCount: 1,
  encoding: "pcm",
};

const DefaultAudioOutputConfiguration: AudioConfiguration = {
  audioType: "SPEECH",
  mediaType: "audio/lpcm",
  sampleRateHertz: 16000,
  sampleSizeBits: 16,
  channelCount: 1,
  encoding: "pcm",
  voiceId: "Matthew",
};

const DefaultSystemPrompt = "You are a helpful AI assistant.";

const WeatherToolSchema = {
  type: "object",
  properties: {
    latitude: {
      type: "number",
      description: "Latitude coordinate",
    },
    longitude: {
      type: "number",
      description: "Longitude coordinate",
    },
  },
  required: ["latitude", "longitude"],
};

export class NovaSonicClient {
  private client: BedrockRuntimeClient;
  private inferenceConfig: InferenceConfig;
  private promptName: string;
  private audioContentId: string;
  private eventQueue: any[] = [];
  private modelId: string;
  private region: string;

  constructor(config: {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken?: string;
    };
    inferenceConfig?: InferenceConfig;
    modelId?: string;
  }) {
    this.region = config.region;

    // Validate region - Nova Sonic is only available in specific regions
    const validRegions = ["us-east-1"];
    if (!validRegions.includes(this.region)) {
      console.warn(
        `Warning: Nova Sonic may not be available in ${
          this.region
        }. Valid regions are: ${validRegions.join(", ")}`
      );
    }

    this.client = new BedrockRuntimeClient({
      region: config.region,
      credentials: config.credentials,
      maxAttempts: 3,
      requestHandler: {
        connectionTimeout: 60000,
        socketTimeout: 300000,
      },
    });

    this.inferenceConfig = config.inferenceConfig ?? {
      maxTokens: 1024,
      topP: 0.9,
      temperature: 0.7,
    };

    // Use provided model ID or default
    this.modelId = config.modelId || "amazon.nova-sonic-v1:0";
    console.log(`Using model ID: ${this.modelId} in region: ${this.region}`);

    this.promptName = crypto.randomUUID();
    this.audioContentId = crypto.randomUUID();
  }

  private addEvent(event: any) {
    this.eventQueue.push(event);
  }

  setupSession() {
    this.addEvent({
      event: {
        sessionStart: {
          inferenceConfiguration: this.inferenceConfig,
        },
      },
    });
  }

  setupPromptStart() {
    this.addEvent({
      event: {
        promptStart: {
          promptName: this.promptName,
          textOutputConfiguration: {
            mediaType: "text/plain",
          },
          audioOutputConfiguration: DefaultAudioOutputConfiguration,
          toolUseOutputConfiguration: {
            mediaType: "application/json",
          },
          toolConfiguration: {
            tools: [
              {
                toolSpec: {
                  name: "getDateAndTimeTool",
                  description:
                    "Get information about the current date and time.",
                  inputSchema: {
                    json: {
                      type: "object",
                      properties: {},
                      required: [],
                    },
                  },
                },
              },
              {
                toolSpec: {
                  name: "getWeatherTool",
                  description: "Get the current weather for a given location.",
                  inputSchema: {
                    json: WeatherToolSchema,
                  },
                },
              },
            ],
          },
        },
      },
    });
  }

  setupSystemPrompt(content: string = DefaultSystemPrompt) {
    const textPromptId = crypto.randomUUID();

    this.addEvent({
      event: {
        contentStart: {
          promptName: this.promptName,
          contentName: textPromptId,
          type: "TEXT",
          interactive: false,
          role: "SYSTEM",
          textInputConfiguration: {
            mediaType: "text/plain",
          },
        },
      },
    });

    this.addEvent({
      event: {
        textInput: {
          promptName: this.promptName,
          contentName: textPromptId,
          content: content,
        },
      },
    });

    this.addEvent({
      event: {
        contentEnd: {
          promptName: this.promptName,
          contentName: textPromptId,
        },
      },
    });
  }

  setupAudioStart() {
    this.addEvent({
      event: {
        contentStart: {
          promptName: this.promptName,
          contentName: this.audioContentId,
          type: "AUDIO",
          interactive: true,
          role: "USER",
          audioInputConfiguration: DefaultAudioInputConfiguration,
        },
      },
    });
  }

  addAudioChunk(audioBase64: string) {
    this.addEvent({
      event: {
        audioInput: {
          promptName: this.promptName,
          contentName: this.audioContentId,
          content: audioBase64,
        },
      },
    });
  }

  endAudioContent() {
    this.addEvent({
      event: {
        contentEnd: {
          promptName: this.promptName,
          contentName: this.audioContentId,
        },
      },
    });
  }

  endPrompt() {
    this.addEvent({
      event: {
        promptEnd: {
          promptName: this.promptName,
        },
      },
    });
  }

  endSession() {
    this.addEvent({
      event: {
        sessionEnd: {},
      },
    });
  }

  private async *generateEvents() {
    console.log(`Generating ${this.eventQueue.length} events for Bedrock`);

    for (let i = 0; i < this.eventQueue.length; i++) {
      const event = this.eventQueue[i];
      const eventJson = JSON.stringify(event);

      // Log first few events for debugging
      if (i < 5) {
        console.log(`Event ${i}:`, eventJson.substring(0, 200));
      }

      yield {
        chunk: {
          bytes: new TextEncoder().encode(eventJson),
        },
      };

      // Small delay between events to prevent overwhelming the stream
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    console.log("All events generated");
  }

  async processStream(
    onEvent: (type: string, data: any) => void | Promise<void>
  ) {
    try {
      console.log(`Starting bidirectional stream with Bedrock...`);
      console.log(`Model: ${this.modelId}, Region: ${this.region}`);

      const command = new InvokeModelWithBidirectionalStreamCommand({
        modelId: this.modelId,
        body: this.generateEvents(),
      });

      const response = await this.client.send(command, {
        requestTimeout: 300000, // 5 minutes
      });

      console.log("Stream established, processing responses...");

      for await (const event of response.body) {
        if (event.chunk?.bytes) {
          const textResponse = new TextDecoder().decode(event.chunk.bytes);

          try {
            const jsonResponse = JSON.parse(textResponse);

            if (jsonResponse.event) {
              const eventType = Object.keys(jsonResponse.event)[0];
              const eventData = jsonResponse.event[eventType];

              console.log(`Received event: ${eventType}`);

              // Map event types to simpler names for client
              if (eventType === "textOutput") {
                await onEvent("textOutput", eventData);
              } else if (eventType === "audioOutput") {
                await onEvent("audioOutput", eventData);
              } else if (eventType === "toolUse") {
                await onEvent("toolUse", eventData);
              } else if (eventType === "promptEnd") {
                console.log("Prompt ended");
              } else if (eventType === "sessionEnd") {
                console.log("Session ended");
              } else {
                // Handle other events
                console.log(`Other event: ${eventType}`, eventData);
              }
            }
          } catch (e) {
            console.error("Parse error:", e);
            console.error("Response text:", textResponse);
          }
        }
      }

      console.log("Stream processing completed");
    } catch (error) {
      console.error("Stream error:", error);

      // Provide more detailed error information
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        // Check for specific error types
        if (error.message.includes("model identifier is invalid")) {
          console.error("\n=== MODEL ACCESS ERROR ===");
          console.error(`Model ID: ${this.modelId}`);
          console.error(`Region: ${this.region}`);
          console.error("\nPossible solutions:");
          console.error(
            "1. Ensure you have requested access to Nova Sonic in AWS Bedrock Console"
          );
          console.error(
            "2. Verify the model is available in your region (use us-east-1 or us-west-2)"
          );
          console.error(
            "3. Check that your AWS credentials have bedrock:InvokeModel permissions"
          );
          console.error("4. Wait a few minutes after requesting model access");
          console.error("========================\n");
        }
      }

      throw error;
    }
  }
}
