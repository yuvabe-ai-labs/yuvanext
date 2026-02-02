import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles } from "lucide-react";
import { useChatbotStream } from "@/hooks/useChatbotStream";
import { useProfile } from "@/hooks/useProfile";
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
  question?: string;
  options?: string[] | null;
  fieldType?: string;
}

const Chatbot = () => {
  const { data: session, isPending: sessionPending } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    messages: chatMessages,
    streamingMessage,
    loading: isLoading,
    onboardingCompleted,
    sendMessage: sendBackendMessage,
  } = useChatbotStream();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [initialGreetingSent, setInitialGreetingSent] = useState(false);

  const userRole = profile?.role || "";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold">
            {boldText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  useEffect(() => {
    if (!sessionPending && !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the chatbot",
        variant: "destructive",
      });
      navigate("/auth/candidate/signin");
    }
  }, [session, sessionPending, navigate, toast]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingMessage]);

  useEffect(() => {
    if (onboardingCompleted) {
      setIsCompleted(true);
    }
  }, [onboardingCompleted]);

  useEffect(() => {
    if (chatMessages.length === 0 && messages.length <= 1) return;

    const updatedMessages: Message[] = chatMessages.map((msg, index) => ({
      id: `backend-${index}`,
      content: msg.content,
      role: msg.role === "user" ? "user" : "assistant",
      timestamp: new Date(),
      question: msg.question,
      options: msg.options,
      fieldType: msg.fieldType,
    }));

    const initialGreeting = messages.find((m) => m.id === "initial");
    if (initialGreeting && initialGreetingSent) {
      setMessages([initialGreeting, ...updatedMessages]);
    } else {
      setMessages(updatedMessages);
    }
  }, [chatMessages, initialGreetingSent]);

  const startChat = async () => {
    setShowChat(true);
    setInitialGreetingSent(false);

    setTimeout(() => {
      const name = profile?.name || session?.user?.name || "there";
      const initialMessage: Message = {
        id: "initial",
        content: `Hey, ${name}! 👋`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      setInitialGreetingSent(true);
    }, 500);
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isLoading) return;

    setInputValue("");
    setSelectedOptions([]);

    try {
      await sendBackendMessage(content);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Sorry, I'm having trouble responding right now.",
        variant: "destructive",
      });
    }
  };

  const getQuestionType = (message: Message) => {
    if (!message.options || message.options.length === 0) return "single";

    if (message.fieldType === "multiselect") return "multi";

    // Fallback keyword check
    const multiSelectKeywords = [
      "select all",
      "choose multiple",
      "pick all",
      "multiple",
    ];
    const hasMultiKeyword = message.options.some((opt) =>
      multiSelectKeywords.some((keyword) =>
        opt.toLowerCase().includes(keyword),
      ),
    );
    return hasMultiKeyword || message.options.length > 7 ? "multi" : "single";
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg?.options) {
      const questionType = getQuestionType(lastMsg);
      setIsMultiSelect(questionType === "multi");
      setSelectedOptions([]);
    }
  }, [messages]);

  const handleOptionClick = (option: string) => {
    if (isMultiSelect) {
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option],
      );
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
      <div className="space-y-2 mt-2">
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option);
            return (
              <Button
                key={option}
                onClick={() => handleOptionClick(option)}
                disabled={isLoading}
                className={`px-4 py-2 border rounded-full text-sm transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-blue-500 text-blue-600 bg-transparent hover:bg-blue-50"
                }`}
                variant="ghost"
                size="sm"
              >
                {option}
                {isSelected && isMultiSelect && " ✓"}
              </Button>
            );
          })}
        </div>
        {isMultiSelect && selectedOptions.length > 0 && (
          <div className="flex gap-2 items-center">
            <Button
              onClick={handleSubmitMultiSelect}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
              size="sm"
            >
              Submit ({selectedOptions.length} selected)
            </Button>
            <Button
              onClick={() => setSelectedOptions([])}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-full text-sm"
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

  if (sessionPending || profileLoading) {
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

  if (!session) return null;

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
                ? "Let's have a quick chat to set up your unit profile!"
                : "Let's have a quick chat to personalize your internship journey!"}
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
            <Sparkles className="w-4 h-4 mr-2" /> Get Started
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
              <h3 className="font-semibold mt-3">5 Matching Internships</h3>
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
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center"
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
            Let's have a quick chat to personalize your internship journey!
          </p>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 scrollbar-none overflow-y-auto mb-4 px-2 flex flex-col select-text"
        >
          <div className="space-y-4 mt-auto">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
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
                  <div className="flex flex-col w-full">
                    <Card
                      className={`p-3 rounded-3xl border select-text ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent border-blue-500 text-blue-600"}`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {renderMessageContent(message.content)}
                      </div>
                      {message.question && (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-2">
                          {renderMessageContent(message.question)}
                        </div>
                      )}
                    </Card>

                    {message.role === "assistant" &&
                      message.options &&
                      message.options.length > 0 &&
                      !isLoading &&
                      !streamingMessage &&
                      index === messages.length - 1 && (
                        <div className="ml-0">
                          {renderQuickOptions(message.options)}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}

            {streamingMessage && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={chatbotAvatar}
                      alt="AI Assistant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <Card className="p-3 rounded-3xl border bg-transparent border-blue-500 text-blue-600 select-text">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {renderMessageContent(streamingMessage)}
                        <span className="inline-block w-1.5 h-4 bg-blue-600 ml-1 animate-pulse align-middle"></span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={chatbotAvatar}
                      alt="AI Assistant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Card className="p-3 rounded-3xl border bg-transparent border-blue-500 text-blue-600">
                    <div className="flex space-x-1 py-1">
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
                  </Card>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} className="h-2" />
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
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
