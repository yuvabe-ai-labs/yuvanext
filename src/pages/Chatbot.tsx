import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/ui/use-toast";
import { Send, Sparkles } from "lucide-react";
import { useChatbotStreaming } from "@/hooks/useChatbot";
import chatbotAvatar from "@/assets/chatbot.png";
import logo from "@/assets/logo-3.png";
import bag from "@/assets/bag.svg";
import book from "@/assets/book.svg";
import paper from "@/assets/paper.svg";
import mathingIntershipSvg from "@/assets/MathingIntership.svg";
import aurovilleUnitSvg from "@/assets/AurovilleUnit.svg";
import SkillCoursesSvg from "@/assets/SkillCourses.svg";
import ChatBG from "@/assets/chatBG.png";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  options?: string[];
  isStreaming?: boolean;
}

const Chatbot = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    sendMessage: sendStreamingMessage,
    isLoading,
    abort,
  } = useChatbotStreaming();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the chatbot",
        variant: "destructive",
      });
      navigate("/auth/candidate/signin");
    }
  }, [session, isPending, navigate, toast]);

  // Auto-focus input whenever messages or quick options update
  useEffect(() => {
    if (!isTyping && !isLoading) {
      inputRef.current?.focus();
    }
  }, [messages, isTyping, isLoading]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch user profile/role on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        // TODO: Fetch user profile to get role and onboarding status
        // For now, using placeholder
        setUserRole("student"); // or "unit"
        // setIsCompleted(profile.onboarding_completed);
      }
    };

    fetchUserProfile();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startChat = async () => {
    setShowChat(true);
    setIsTyping(true);

    setTimeout(() => {
      const name = user?.name || user?.email?.split("@")[0] || "there";

      const initialMessage: Message = {
        id: "1",
        content: `Hey, ${name}! 👋`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const extractOptions = (
    responseText: string
  ): { cleanText: string; options: string[] } => {
    let cleanText = responseText;
    let options: string[] = [];

    // Check if this is a "type" question (free text input) vs "choose" question (buttons)
    const isTypeQuestion = /you can type/i.test(responseText);
    const isChoiceQuestion = /please (choose|pick|select|type) one/i.test(
      responseText
    );

    // If it's a type question, don't extract options - let user type freely
    if (isTypeQuestion && !isChoiceQuestion) {
      // Just clean up the text a bit
      cleanText = responseText.replace(/\(you can type.*?\)/gi, "").trim();
      return { cleanText, options: [] };
    }

    // Pattern 1: Bold options like "**9th**, **10th**, **11th**, **12th**, or **Other**"
    const boldPattern = /\*\*([^*]+)\*\*/g;
    const boldMatches = [...responseText.matchAll(boldPattern)];

    // Check if we have multiple bold items in a list-like context
    if (boldMatches.length >= 2) {
      const potentialOptions = boldMatches.map((match) => match[1].trim());

      // Filter out emoji-only options (like 2️⃣)
      const validOptions = potentialOptions.filter(
        (opt) => opt.length > 1 && !/^[\u{1F300}-\u{1F9FF}]+$/u.test(opt)
      );

      if (validOptions.length >= 2) {
        // Check if they appear together (likely a list)
        const matchPositions = boldMatches.map((m) => m.index || 0);
        const isClusteredList = matchPositions.every(
          (pos, i) => i === 0 || pos - matchPositions[i - 1] < 150
        );

        if (isClusteredList) {
          options = validOptions;

          // Remove the "Please pick/choose..." sentence and the options list
          cleanText = cleanText
            .replace(
              /Please (pick|choose|select) one( of the following)?:.*$/is,
              ""
            )
            .replace(/\*\*[^*]+\*\*/g, "")
            .replace(/,\s*(or|and)\s*/g, "")
            .replace(/,\s*,/g, ",")
            .replace(/\s+/g, " ")
            .trim();

          return { cleanText, options };
        }
      }
    }

    // Pattern 2: Letter prefixes like "A) Option" or "A. Option"
    const letterPattern = /^([A-Z])[.)]\s*(.+?)$/gm;
    const letterMatches = [...responseText.matchAll(letterPattern)];

    if (letterMatches.length >= 2) {
      options = letterMatches.map((match) => match[2].trim());

      // Remove the options from the text
      letterMatches.forEach((match) => {
        cleanText = cleanText.replace(match[0], "");
      });

      // Clean up instruction text
      cleanText = cleanText
        .replace(/\(?\s*[Jj]ust (reply|type|select).*?\)?\s*/gi, "")
        .replace(/\(?\s*[Pp]lease (reply|type|select).*?\)?\s*/gi, "")
        .replace(/\(?\s*[Yy]ou can (type|reply|select).*?\)?\s*/gi, "")
        .replace(/\n\n+/g, "\n\n")
        .trim();

      return { cleanText, options };
    }

    // Pattern 3: Markdown bullet lists
    const listPattern = /^[-*]\s+(.+)$/gm;
    const listMatches = [...responseText.matchAll(listPattern)];

    if (listMatches.length >= 2) {
      options = listMatches.map((match) => match[1].trim());
      cleanText = responseText.replace(listPattern, "").trim();
      return { cleanText, options };
    }

    // Pattern 4: Numbered lists
    const numberedPattern = /^\d+\.\s+(.+)$/gm;
    const numberedMatches = [...responseText.matchAll(numberedPattern)];

    if (numberedMatches.length >= 2) {
      options = numberedMatches.map((match) => match[1].trim());
      cleanText = responseText.replace(numberedPattern, "").trim();
      return { cleanText, options };
    }

    return { cleanText: responseText, options: [] };
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();

    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setSelectedOptions([]);

    // Create placeholder for streaming assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    streamingMessageIdRef.current = assistantMessageId;

    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let accumulatedText = "";

      await sendStreamingMessage(
        {
          message: content,
          conversationHistory,
        },
        // onChunk callback
        (chunk: string) => {
          accumulatedText += chunk;

          // Update the streaming message with accumulated text (don't extract options yet)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedText, isStreaming: true }
                : msg
            )
          );

          // Scroll to bottom during streaming
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 0);
        },
        // onComplete callback
        (data) => {
          const finalText = data.fullResponse || accumulatedText;

          // Extract options from final response
          const { cleanText, options } = extractOptions(finalText);

          console.log("Final text:", finalText);
          console.log("Extracted options:", options);
          console.log("Clean text:", cleanText);

          // Check if conversation is complete
          const isComplete =
            finalText.includes("Perfect! You're all set!") ||
            finalText.includes("find the best matches") ||
            finalText.includes("find the best candidates") ||
            data.onboardingCompleted;

          // Update message with final content and options
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: cleanText,
                    options: options.length > 0 ? options : undefined,
                    isStreaming: false,
                  }
                : msg
            )
          );

          setIsTyping(false);
          streamingMessageIdRef.current = null;

          if (isComplete) {
            setIsCompleted(true);
          }
        }
      );
    } catch (error: any) {
      console.error("Chat error:", error);
      setIsTyping(false);
      streamingMessageIdRef.current = null;

      // Remove the streaming placeholder on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessageId)
      );

      toast({
        title: "Error",
        description:
          error?.message || "Sorry, I'm having trouble responding right now.",
        variant: "destructive",
      });
    }
  };

  const getQuestionType = (options?: string[]) => {
    if (!options || options.length === 0) return "single";

    const multiSelectKeywords = [
      "select all",
      "choose multiple",
      "pick all",
      "multiple",
    ];

    const hasMultiKeyword = options.some((opt) =>
      multiSelectKeywords.some((keyword) => opt.toLowerCase().includes(keyword))
    );

    return hasMultiKeyword || options.length > 7 ? "multi" : "single";
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg?.role === "assistant" &&
      lastMsg?.options &&
      !lastMsg.isStreaming
    ) {
      const questionType = getQuestionType(lastMsg.options);
      setIsMultiSelect(questionType === "multi");
      setSelectedOptions([]);
    }
  }, [messages]);

  const handleOptionClick = (option: string) => {
    if (isMultiSelect) {
      setSelectedOptions((prev) => {
        if (prev.includes(option)) {
          return prev.filter((o) => o !== option);
        } else {
          return [...prev, option];
        }
      });
    } else {
      sendMessage(option);
      setSelectedOptions([]);
    }
  };

  const handleSubmitMultiSelect = () => {
    if (selectedOptions.length > 0) {
      sendMessage(selectedOptions.join(", "));
      setSelectedOptions([]);
    }
  };

  const renderQuickOptions = (options: string[]) => {
    return (
      <div className="mt-3 space-y-2">
        {options.map((option, index) => {
          const isSelected = selectedOptions.includes(option);
          const letter = String.fromCharCode(65 + index);

          return (
            <Button
              key={`${option}-${index}`}
              onClick={() => handleOptionClick(option)}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg text-sm text-left justify-start transition-colors font-normal ${
                isSelected
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              variant="outline"
              size="sm"
            >
              <span className="font-semibold mr-2">{letter})</span>
              {option}
            </Button>
          );
        })}

        {isMultiSelect && selectedOptions.length > 0 && (
          <div className="flex gap-2 items-center mt-3">
            <Button
              onClick={handleSubmitMultiSelect}
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              size="sm"
            >
              Submit ({selectedOptions.length} selected)
            </Button>
            <Button
              onClick={() => setSelectedOptions([])}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              variant="ghost"
              size="sm"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Show loading while checking auth
  if (isPending) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${ChatBG})` }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Don't render if no session
  if (!session) {
    return null;
  }

  if (!showChat) {
    const isUnit = userRole === "unit";

    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center"
        style={{ backgroundImage: `url(${ChatBG})` }}
      >
        <div className="text-center max-w-md mx-auto space-y-8">
          <div className="flex justify-center">
            <a href="/">
              <img
                src={logo}
                alt="Company Logo"
                className="h-24 w-auto cursor-pointer"
              />
            </a>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              {isUnit
                ? "Welcome to YuvaNext Unit Portal"
                : "Welcome to YuvaNext Internships"}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isUnit
                ? "Let's have a quick chat to set up your unit profile! Our AI assistant will help you connect with the best candidates for your opportunities."
                : "Let's have a quick chat to personalize your internship journey! Our AI assistant will help you discover opportunities that match your passions."}
            </p>
          </div>

          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <img
                src={chatbotAvatar}
                alt="AI Assistant"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {isUnit
                  ? "Hey there! Let's know your unit better"
                  : "Hey mate! Let's know you better"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isUnit
                  ? "Help me with all your unit details here"
                  : "Help me with all your personal details here"}
              </p>
            </div>
          </div>

          <Button
            onClick={startChat}
            size="lg"
            className="bg-gradient-to-br from-[#07636C] to-[#0694A2] hover:opacity-90 text-white px-8 py-3 rounded-full font-medium transition-opacity"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const isUnit = userRole === "unit";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#FFF6EF] py-10 px-4">
        <img src={logo} alt="logo" className="w-20 mb-6" />

        <h1 className="text-2xl font-bold text-[#333] mb-2">You're All Set!</h1>
        <p className="text-sm text-gray-500 mb-12">
          Here's your personalized Yuvanext Dashboard!
        </p>

        {!isUnit && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center bg-white shadow-lg border border-[#C94100] rounded-[15px] p-6 w-[266px] h-[287px]">
              <div className="w-12 h-12 flex items-center justify-center bg-[#FFF4CE] rounded-lg">
                <img src={bag} alt="" className="w-full mt-auto" />
              </div>
              <h3 className="font-semibold font-primary mt-3">
                5 Matching Internships
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Found in business domain
              </p>
              <img
                src={mathingIntershipSvg}
                alt=""
                className="w-94 mt-[10px]"
              />
            </div>

            <div className="flex flex-col items-center text-center bg-white shadow-lg border border-[#C94100] rounded-[15px] p-6 w-[266px] h-[287px]">
              <div className="w-12 h-12 flex items-center justify-center bg-[#FFE8E2] rounded-lg">
                <img src={book} alt="" className="w-full mt-auto" />
              </div>
              <h3 className="font-semibold mt-3">12 Auroville Units</h3>
              <p className="text-sm text-gray-500 mb-3">
                Relevant to your skills
              </p>
              <img src={aurovilleUnitSvg} alt="" className="w-94 mt-3" />
            </div>

            <div className="flex flex-col items-center text-center bg-white shadow-lg border border-[#C94100] rounded-[15px] p-6 w-[266px] h-[287px]">
              <div className="w-12 h-12 flex items-center justify-center bg-[#FFF4CE] rounded-lg">
                <img src={paper} alt="" className="w-full mt-auto" />
              </div>
              <h3 className="font-semibold mt-3">3 Skill Courses</h3>
              <p className="text-sm text-gray-500 mb-3">
                To boost your profile
              </p>
              <img src={SkillCoursesSvg} alt="" className="w-94 mt-3" />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-10 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center px-4 py-2 rounded-[18px] text-white font-medium bg-gradient-to-r from-[#C94100] to-[#FFB592] text-sm min-w-[140px]"
          >
            Explore my Dashboard
          </button>

          {!isUnit && (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center px-4 py-2 rounded-[18px] border border-[#C94100] text-[#C94100] font-medium text-sm min-w-[120px]"
            >
              Update Profile
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-muted flex flex-col items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${ChatBG})` }}
    >
      <div className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <a href="/">
              <img
                src={logo}
                alt="Company Logo"
                className="h-24 w-auto cursor-pointer"
              />
            </a>
          </div>
          <h1 className="text-4xl font-bold text-foreground my-4">
            Welcome to YuvaNext
          </h1>
          <p className="text-muted-foreground text-l">
            Let's have a quick chat to personalize your internship journey! Our
            AI assistant will help you discover opportunities that match your
            passions.
          </p>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto mb-4 px-2 flex flex-col scrollbar-none"
        >
          <div className="flex-1"></div>

          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={chatbotAvatar}
                        alt="AI Assistant"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col">
                    <Card
                      className={`p-3 rounded-3xl border ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white border-gray-200 text-gray-800"
                      }`}
                    >
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-none pl-0 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-none pl-0 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="ml-0">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        {/* Show streaming cursor */}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-gray-800 ml-1 animate-pulse"></span>
                        )}
                      </div>
                    </Card>

                    {message.role === "assistant" &&
                      message.options &&
                      message.options.length > 0 &&
                      !message.isStreaming &&
                      !isLoading &&
                      message.id === messages[messages.length - 1]?.id && (
                        <div className="mt-2">
                          {renderQuickOptions(message.options)}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && !messages[messages.length - 1]?.isStreaming && (
              <div className="flex justify-start items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={chatbotAvatar}
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-2 border border-blue-500 text-blue-600 rounded-full inline-block">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-300"
            />
            <Button
              onClick={() => {
                sendMessage();
                inputRef.current?.focus();
              }}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-4 rounded-full flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
