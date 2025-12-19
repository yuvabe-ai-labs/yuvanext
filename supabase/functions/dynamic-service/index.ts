// supabase/functions/dynamic-service/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { NovaSonicClient } from "./bedrock-client.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StreamRequest {
  audioChunks?: string[];
  systemPrompt?: string;
  inferenceConfig?: {
    maxTokens: number;
    topP: number;
    temperature: number;
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");

    // Force use of us-east-1 since Nova Sonic is only available there
    const awsRegion = "us-east-1";

    console.log(
      `Using AWS Region: ${awsRegion} (forced for Nova Sonic compatibility)`
    );

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error("AWS credentials not configured");
    }

    const requestData: StreamRequest = await req.json();

    console.log(
      "Request received with",
      requestData.audioChunks?.length || 0,
      "audio chunks"
    );

    if (!requestData.audioChunks || requestData.audioChunks.length === 0) {
      throw new Error("No audio chunks provided");
    }

    const client = new NovaSonicClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
      inferenceConfig: requestData.inferenceConfig,
      modelId: "amazon.nova-sonic-v1:0",
    });

    console.log("Setting up Nova Sonic session...");
    client.setupSession();
    client.setupPromptStart();
    client.setupSystemPrompt(
      requestData.systemPrompt || "You are a helpful voice assistant."
    );
    client.setupAudioStart();

    console.log(`Adding ${requestData.audioChunks.length} audio chunks...`);
    for (const chunk of requestData.audioChunks) {
      client.addAudioChunk(chunk);
    }

    client.endAudioContent();
    client.endPrompt();
    client.endSession();

    console.log("Session setup complete, starting stream...");

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          await client.processStream(async (eventType, data) => {
            console.log(`SSE Event: ${eventType}`);

            const sseData = `event: ${eventType}\ndata: ${JSON.stringify(
              data
            )}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          });

          console.log("Stream completed successfully");
          const completeData = `event: complete\ndata: ${JSON.stringify({
            done: true,
          })}\n\n`;
          controller.enqueue(encoder.encode(completeData));

          controller.close();
        } catch (error) {
          console.error("Stream processing error:", error);

          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            errorMessage = error.message;

            if (errorMessage.includes("model identifier is invalid")) {
              errorMessage = `Model access error: Please ensure you have requested access to Nova Sonic (amazon.nova-sonic-v1:0) in the AWS Bedrock Console for region us-east-1`;
            }
          }

          const errorData = `event: error\ndata: ${JSON.stringify({
            error: errorMessage,
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
