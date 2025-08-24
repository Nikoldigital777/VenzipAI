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
  Loader2
} from "lucide-react";

interface ChatMessage {
  id: string;
  message: string;
  messageType: 'user' | 'assistant';
  createdAt: string;
}

export default function AIChat() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Quick action prompts
  const quickPrompts = [
    { icon: Shield, text: "How do I start SOC 2 compliance?", color: "text-blue-600" },
    { icon: FileText, text: "What documents do I need for ISO 27001?", color: "text-green-600" },
    { icon: AlertTriangle, text: "What are the most critical risks?", color: "text-red-600" },
    { icon: Clock, text: "How long does compliance take?", color: "text-orange-600" }
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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", { message: messageText });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessageMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
    sendMessageMutation.mutate(prompt);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-in" data-testid="ai-chat-window">
          <Card className="glass-card w-96 h-[500px] shadow-2xl border-0 bg-white/95 backdrop-blur-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-venzip-primary/5 to-venzip-accent/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Claude Assistant</h3>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-green-200 text-green-700 bg-green-50">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      Online
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI-powered compliance guidance
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
            
            <div className="p-4 h-80 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <>
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-tl-sm max-w-xs shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          👋 Hi! I'm Claude, your AI compliance assistant. I can help you with SOC 2, ISO 27001, HIPAA, and GDPR questions.
                        </p>
                      </div>
                    </div>
                    
                    {/* Quick Action Prompts */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium px-1">Quick actions:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {quickPrompts.map((prompt, index) => {
                          const IconComponent = prompt.icon;
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickPrompt(prompt.text)}
                              className="justify-start h-auto p-3 text-left hover:bg-gray-50 border-gray-200 hover:border-gray-300 transition-all duration-200"
                              disabled={sendMessageMutation.isPending}
                            >
                              <IconComponent className={`h-4 w-4 mr-2 ${prompt.color}`} />
                              <span className="text-xs text-gray-700">{prompt.text}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  [...messages].reverse().map((msg: ChatMessage) => (
                    <div key={msg.id} className={`flex space-x-3 ${msg.messageType === 'user' ? 'justify-end' : ''}`}>
                      {msg.messageType === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl max-w-xs shadow-sm border transition-all duration-200 ${
                        msg.messageType === 'user' 
                          ? 'bg-gradient-to-r from-venzip-primary to-venzip-accent text-white rounded-tr-sm border-venzip-primary/20' 
                          : 'bg-white text-gray-800 rounded-tl-sm border-gray-100 hover:shadow-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                      {msg.messageType === 'user' && (
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {sendMessageMutation.isPending && (
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-venzip-primary to-venzip-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-sm max-w-xs shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-venzip-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-venzip-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-venzip-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Claude is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200/50 bg-white/50">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Ask about compliance, frameworks, or risks..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sendMessageMutation.isPending}
                    className="text-sm focus:ring-2 focus:ring-venzip-primary focus:border-venzip-primary border-gray-200 rounded-xl pl-4 pr-12 h-11 shadow-sm"
                    data-testid="input-chat-message"
                  />
                  <HelpCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button 
                  type="submit"
                  disabled={sendMessageMutation.isPending || !message.trim()}
                  className="bg-gradient-to-r from-venzip-primary to-venzip-accent text-white hover:shadow-lg transition-all duration-200 rounded-xl px-4 h-11 min-w-[44px]"
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* AI Chat Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50" data-testid="ai-chat-bubble">
          <Button
            onClick={toggleChat}
            className="group w-16 h-16 bg-gradient-to-r from-venzip-primary via-venzip-accent to-venzip-secondary text-white rounded-full shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <MessageCircle className="h-8 w-8 relative z-10 group-hover:scale-110 transition-transform duration-200" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-venzip-primary/50 to-venzip-accent/50 rounded-full animate-ping opacity-75"></div>
          </Button>
        </div>
      )}
    </>
  );
}
