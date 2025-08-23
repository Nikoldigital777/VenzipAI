import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-scale-in" data-testid="ai-chat-window">
          <Card className="glass-card w-80 h-96 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Claude Assistant</h3>
                  <p className="text-xs text-gray-500">Compliance guidance</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleChat}
                data-testid="button-close-chat"
              >
                <i className="fas fa-times text-gray-400 hover:text-gray-600"></i>
              </Button>
            </div>
            
            <div className="p-4 h-64 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div className="bg-white p-3 rounded-lg max-w-xs">
                      <p className="text-sm text-gray-800">
                        Hi! I'm Claude, your compliance assistant. How can I help you today?
                      </p>
                    </div>
                  </div>
                ) : (
                  [...messages].reverse().map((msg: ChatMessage) => (
                    <div key={msg.id} className={`flex space-x-2 ${msg.messageType === 'user' ? 'justify-end' : ''}`}>
                      {msg.messageType === 'assistant' && (
                        <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-robot text-white text-xs"></i>
                        </div>
                      )}
                      <div className={`p-3 rounded-lg max-w-xs ${
                        msg.messageType === 'user' 
                          ? 'bg-venzip-primary text-white' 
                          : 'bg-white text-gray-800'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      {msg.messageType === 'user' && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-user text-white text-xs"></i>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {sendMessageMutation.isPending && (
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div className="bg-white p-3 rounded-lg max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Ask about compliance..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 text-sm focus:ring-2 focus:ring-venzip-primary focus:border-transparent"
                  data-testid="input-chat-message"
                />
                <Button 
                  type="submit"
                  disabled={sendMessageMutation.isPending || !message.trim()}
                  className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-200"
                  data-testid="button-send-message"
                >
                  <i className="fas fa-paper-plane"></i>
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
            className="w-14 h-14 bg-gradient-primary text-white rounded-full shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center relative"
          >
            <i className="fas fa-robot text-xl"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-danger rounded-full animate-pulse"></span>
          </Button>
        </div>
      )}
    </>
  );
}
