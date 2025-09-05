import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  X, 
  User, 
  Send, 
  MessageCircle,
  Sparkles,
  HelpCircle,
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  Loader2,
  Zap,
  Star,
  TrendingUp,
  Brain,
  CheckCircle2,
  MessageSquare,
  ArrowUp,
  Mic,
  VolumeX,
  Volume2,
  Target
} from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  messageType: 'user' | 'assistant';
  createdAt: string;
}

// Helper function to format messages with basic markdown support
const formatMessage = (text: string) => {
  // Split text into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, index) => {
    // Handle bullet points
    if (paragraph.includes('•') || paragraph.includes('-') || paragraph.includes('*')) {
      const lines = paragraph.split('\n');
      return (
        <div key={index} className="space-y-1">
          {lines.map((line, lineIndex) => {
            const trimmed = line.trim();
            if (trimmed.match(/^[•\-\*]\s/)) {
              return (
                <div key={lineIndex} className="flex items-start gap-2">
                  <span className="text-venzip-primary mt-1">•</span>
                  <span>{trimmed.replace(/^[•\-\*]\s/, '')}</span>
                </div>
              );
            }
            return <div key={lineIndex}>{trimmed}</div>;
          })}
        </div>
      );
    }
    
    // Handle numbered lists
    if (paragraph.match(/^\d+\./)) {
      const lines = paragraph.split('\n');
      return (
        <div key={index} className="space-y-1">
          {lines.map((line, lineIndex) => {
            const trimmed = line.trim();
            if (trimmed.match(/^\d+\./)) {
              return (
                <div key={lineIndex} className="flex items-start gap-2">
                  <span className="text-venzip-primary font-semibold min-w-[1.2rem]">
                    {trimmed.match(/^\d+/)?.[0]}.
                  </span>
                  <span>{trimmed.replace(/^\d+\.\s/, '')}</span>
                </div>
              );
            }
            return <div key={lineIndex}>{trimmed}</div>;
          })}
        </div>
      );
    }
    
    // Handle bold text **text**
    const formatInlineStyles = (text: string) => {
      return text.split(/(\*\*.*?\*\*)/).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-semibold text-venzip-primary">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };
    
    // Regular paragraph
    return (
      <div key={index} className="mb-2 last:mb-0">
        {formatInlineStyles(paragraph)}
      </div>
    );
  });
};

export default function AIChat() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Enhanced quick action prompts with categories
  const quickPrompts = [
    { icon: Shield, text: "What's left to be compliant?", color: "text-blue-600", category: "Status Check", bg: "from-blue-500/10 to-blue-600/5" },
    { icon: Target, text: "What should I prioritize next?", color: "text-green-600", category: "Next Steps", bg: "from-green-500/10 to-green-600/5" },
    { icon: AlertTriangle, text: "What are my biggest risks?", color: "text-red-600", category: "Risk Assessment", bg: "from-red-500/10 to-red-600/5" },
    { icon: Clock, text: "How long until I'm compliant?", color: "text-orange-600", category: "Timeline", bg: "from-orange-500/10 to-orange-600/5" },
    { icon: TrendingUp, text: "Analyze my compliance gaps", color: "text-purple-600", category: "Gap Analysis", bg: "from-purple-500/10 to-purple-600/5" },
    { icon: Brain, text: "Generate action plan", color: "text-indigo-600", category: "AI Strategy", bg: "from-indigo-500/10 to-indigo-600/5" }
  ];
  
  // Achievement system
  const achievements = [
    { threshold: 1, icon: Star, text: "First question!", unlocked: messageCount >= 1 },
    { threshold: 5, icon: Zap, text: "Getting curious!", unlocked: messageCount >= 5 },
    { threshold: 10, icon: Brain, text: "AI enthusiast!", unlocked: messageCount >= 10 }
  ];

  // Listen for global toggle events from navbar
  useEffect(() => {
    const open = () => setIsOpen(true);
    const toggle = () => setIsOpen(prev => !prev);
    window.addEventListener("open-ai-chat", open as any);
    window.addEventListener("toggle-ai-chat", toggle as any);
    return () => {
      window.removeEventListener("open-ai-chat", open as any);
      window.removeEventListener("toggle-ai-chat", toggle as any);
    };
  }, []);

  // Fetch chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/messages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/chat/messages?limit=20");
      return response.json();
    },
    enabled: isOpen,
  });

  // Enhanced send message mutation with context-aware compliance guidance
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      setIsTyping(true);
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      // Get current user context for Claude
      const [companyResponse, summaryResponse] = await Promise.all([
        apiRequest("GET", "/api/company").catch(() => null),
        apiRequest("GET", "/api/summary").catch(() => null)
      ]);
      
      const company = companyResponse ? await companyResponse.json() : null;
      const summary = summaryResponse ? await summaryResponse.json() : null;
      
      const response = await apiRequest("POST", "/api/chat", { 
        message: messageText,
        context: {
          company,
          summary,
          timestamp: new Date().toISOString()
        }
      });
      return response.json();
    },
    onSuccess: () => {
      setIsTyping(false);
      setMessageCount(prev => prev + 1);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
      // Show achievement toast for milestones
      const newAchievement = achievements.find(a => a.threshold === messageCount + 1);
      if (newAchievement) {
        toast({
          title: "🎉 Achievement Unlocked!",
          description: newAchievement.text,
          duration: 3000,
        });
      }
    },
    onError: (error: Error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Enhanced scroll behavior
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if user has scrolled up from bottom
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 3);
    }
  };

  // Scroll to bottom when new messages arrive or when typing starts
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM is updated
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // Add scroll listener to messages container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
    // Add a brief animation delay for better UX
    setTimeout(() => {
      sendMessageMutation.mutate(prompt);
    }, 300);
  };
  
  // Hide welcome animation after first interaction
  useEffect(() => {
    if (messageCount > 0) {
      setShowWelcomeAnimation(false);
    }
  }, [messageCount]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Enhanced AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-in" data-testid="ai-chat-window">
          <Card className="glass-card w-[420px] max-h-[80vh] min-h-[600px] shadow-2xl border-0 bg-white/95 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 animate-fadeInUp relative overflow-hidden flex flex-col">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-venzip-primary/5 via-transparent to-venzip-accent/5 opacity-50"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-venzip-primary/10 to-transparent rounded-full blur-2xl animate-float"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-venzip-accent/10 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-venzip-primary/8 to-venzip-accent/8 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-glow-pulse">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 text-lg">Claude</h3>
                    <Badge className="text-xs px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm animate-pulse">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                    {messageCount > 0 && (
                      <Badge variant="outline" className="text-xs px-2 py-1 border-venzip-primary/30 text-venzip-primary bg-venzip-primary/10">
                        {messageCount} chats
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Sparkles className="h-4 w-4 text-venzip-primary animate-pulse" />
                    <span className="font-medium">AI Compliance Expert</span>
                    {isTyping && (
                      <span className="text-venzip-primary font-medium animate-pulse">typing...</span>
                    )}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleChat}
                className="hover:bg-gray-100 rounded-full w-8 h-8"
                data-testid="button-close-chat"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            </div>
            
            <div 
              ref={messagesContainerRef}
              className="p-4 flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white/80 relative z-10 scrollbar-thin scrollbar-thumb-venzip-primary/20 scrollbar-track-transparent scroll-smooth"
            >
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <>
                    <div className={`flex space-x-4 ${showWelcomeAnimation ? 'animate-fadeInUp' : ''}`}>
                      <div className="w-12 h-12 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg animate-bounce">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div className="bg-white p-4 rounded-3xl rounded-tl-md max-w-[300px] shadow-lg border border-gray-100 relative hover:shadow-xl transition-all duration-300">
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full animate-ping"></div>
                        <p className="text-base text-gray-800 leading-relaxed font-medium">
                          👋 <span className="text-gradient-primary font-bold">Welcome!</span> I'm Claude, your AI compliance expert.
                        </p>
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                          I specialize in <span className="font-semibold text-venzip-primary">SOC 2</span>, <span className="font-semibold text-venzip-secondary">ISO 27001</span>, <span className="font-semibold text-venzip-accent">HIPAA</span>, and <span className="font-semibold text-success-green">GDPR</span> compliance.
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                          <Sparkles className="h-3 w-3 text-venzip-primary animate-pulse" />
                          <span>Powered by Claude AI</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Quick Action Prompts */}
                    <div className={`space-y-4 mt-6 ${showWelcomeAnimation ? 'animate-fadeInUp' : ''}`} style={{animationDelay: '0.3s'}}>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-venzip-primary" />
                        <p className="text-sm text-gray-700 font-semibold">Quick Start Options</p>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {quickPrompts.map((prompt, index) => {
                          const IconComponent = prompt.icon;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickPrompt(prompt.text)}
                              className={`justify-start h-auto p-4 text-left hover:shadow-lg border-0 bg-gradient-to-r ${prompt.bg} hover:scale-105 transition-all duration-300 group relative overflow-hidden animate-fadeInUp`}
                              style={{animationDelay: `${0.1 * index}s`}}
                              disabled={sendMessageMutation.isPending}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                              <div className="flex items-start gap-3 relative z-10">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                  <IconComponent className={`h-4 w-4 ${prompt.color}`} />
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{prompt.category}</div>
                                  <div className="text-sm text-gray-800 font-medium leading-relaxed">{prompt.text}</div>
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  [...messages].reverse().map((msg: ChatMessage, index) => (
                    <div key={msg.id} className={`flex space-x-4 mb-6 ${msg.messageType === 'user' ? 'justify-end' : ''} animate-fadeInUp`} style={{animationDelay: `${index * 0.1}s`}}>
                      {msg.messageType === 'assistant' && (
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-110 transition-transform duration-300">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-md">
                            <CheckCircle2 className="h-2 w-2 text-white" />
                          </div>
                        </div>
                      )}
                      <div className={`p-4 rounded-3xl shadow-lg border transition-all duration-300 hover:shadow-xl relative group ${
                        msg.messageType === 'user' ? 'max-w-[300px] ml-auto' : 'max-w-[340px]'
                      } ${
                        msg.messageType === 'user' 
                          ? 'bg-gradient-to-r from-venzip-primary to-venzip-accent text-white rounded-tr-lg border-venzip-primary/20' 
                          : 'bg-white text-gray-800 rounded-tl-lg border-gray-100'
                      }`}>
                        {msg.messageType === 'assistant' && (
                          <div className="absolute -top-2 -left-2 w-3 h-3 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full animate-pulse"></div>
                        )}
                        <div className="text-sm leading-relaxed font-medium space-y-2 whitespace-pre-wrap break-words">
                          {formatMessage(msg.message)}
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs opacity-70">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {msg.messageType === 'assistant' && (
                            <div className="flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              <span>AI</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {msg.messageType === 'user' && (
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-110 transition-transform duration-300">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {(sendMessageMutation.isPending || isTyping) && (
                  <div className="flex space-x-4 animate-fadeInUp">
                    <div className="w-10 h-10 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                    <div className="bg-white p-4 rounded-3xl rounded-tl-lg max-w-[320px] shadow-lg border border-gray-100 relative">
                      <div className="absolute -top-2 -left-2 w-3 h-3 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full animate-ping"></div>
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-gradient-to-r from-venzip-accent to-venzip-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-gradient-to-r from-venzip-secondary to-venzip-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 font-medium">Claude is thinking</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Brain className="h-3 w-3 text-venzip-primary animate-pulse" />
                            <span className="text-xs text-gray-500">Processing your request...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollButton && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                  <Button
                    onClick={scrollToBottom}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-venzip-primary border border-venzip-primary/20 rounded-full w-10 h-10 p-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <ArrowUp className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200/50 bg-gradient-to-r from-white/80 to-gray-50/80 relative z-10">
              <div className="space-y-3">
                {/* Quick Status Check Button */}
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={() => handleQuickPrompt("What's left to be compliant?")}
                    disabled={sendMessageMutation.isPending || isTyping}
                    className="bg-gradient-to-r from-success-green to-venzip-primary text-white hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-2xl px-4 py-2 text-sm font-medium group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div className="flex items-center gap-2 relative z-10">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>What's left to be compliant?</span>
                    </div>
                  </Button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Ask about compliance, frameworks, or risks..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending || isTyping}
                      className="text-sm focus:ring-2 focus:ring-venzip-primary focus:border-venzip-primary border-0 rounded-2xl pl-5 pr-14 h-12 shadow-lg bg-white/90 backdrop-blur-sm placeholder:text-gray-500 font-medium"
                      data-testid="input-chat-message"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {message.trim() && (
                        <ArrowUp className="h-4 w-4 text-venzip-primary animate-bounce" />
                      )}
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    disabled={sendMessageMutation.isPending || isTyping || !message.trim()}
                    className="bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary text-white hover:shadow-xl hover:shadow-venzip-primary/25 hover:scale-110 transition-all duration-300 rounded-2xl px-6 h-12 min-w-[48px] relative overflow-hidden group"
                    data-testid="button-send-message"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    {sendMessageMutation.isPending || isTyping ? (
                      <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                    ) : (
                      <Send className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                    )}
                  </Button>
                </form>
              </div>
              
              {/* Achievement indicators */}
              {messageCount > 0 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {achievements.filter(a => a.unlocked).map((achievement, index) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={index} className="flex items-center gap-1 text-xs text-venzip-primary font-medium animate-fadeInUp">
                        <IconComponent className="h-3 w-3" />
                        <span>{achievement.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced AI Chat Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50" data-testid="ai-chat-bubble">
          <div className="relative">
            {/* Floating action hints */}
            <div className="absolute -top-16 -left-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200 animate-bounce opacity-80 hover:opacity-100 transition-opacity">
              <p className="text-xs font-medium text-gray-700 whitespace-nowrap">💬 Ask Claude anything!</p>
              <div className="absolute bottom-0 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/90"></div>
            </div>
            
            <Button
              onClick={toggleChat}
              className="group w-20 h-20 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary text-white rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-500 flex items-center justify-center relative overflow-hidden animate-glow-pulse"
            >
              {/* Background animations */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-venzip-primary/50 to-venzip-accent/50 rounded-3xl animate-ping opacity-75"></div>
              
              {/* Main icon */}
              <MessageCircle className="h-10 w-10 relative z-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />
              
              {/* Status indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse flex items-center justify-center shadow-lg">
                <Sparkles className="h-4 w-4 text-white animate-spin" />
              </div>
              
              {/* Message count badge */}
              {messageCount > 0 && (
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-venzip-secondary to-venzip-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-xs font-bold text-white">{messageCount}</span>
                </div>
              )}
              
              {/* Floating particles */}
              <div className="absolute top-1 left-1 w-2 h-2 bg-white/50 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-3 right-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-2 left-3 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
