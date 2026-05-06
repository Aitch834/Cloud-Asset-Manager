import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupportChat, useCreateSupportTicket } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import type { ChatHistoryItem } from "@workspace/api-client-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatHistoryItem[]>([
    { role: "assistant", content: "Hello! I'm the BDE Farm Trac assistant. Do you have any questions about Red Tractor compliance or our software modules?" }
  ]);
  const [input, setInput] = useState("");
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useSupportChat();
  const ticketMutation = useCreateSupportTicket();

  // Escalate Form State
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatHistoryItem = { role: "user", content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");

    chatMutation.mutate(
      { data: { message: input, conversationHistory: newHistory } },
      {
        onSuccess: (data: { reply: string; suggestEscalation?: boolean }) => {
          setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
          if (data.suggestEscalation) {
            setShowEscalationForm(true);
          }
        },
        onError: () => {
          toast({
            title: "Connection Error",
            description: "Failed to connect to support assistant. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName.trim() || !ticketEmail.trim()) return;

    const firstUserMsg = messages.find(m => m.role === "user");
    const derivedSubject = ticketSubject.trim() || (firstUserMsg ? firstUserMsg.content.slice(0, 80) : "Chat Escalation");

    ticketMutation.mutate(
      {
        data: {
          name: ticketName,
          email: ticketEmail,
          subject: derivedSubject,
          description: "User requested human support via website chat widget.",
          conversationHistory: messages
        }
      },
      {
        onSuccess: () => {
          setShowEscalationForm(false);
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: "Thank you. A support ticket has been created. Our team will contact you at " + ticketEmail + " shortly." }
          ]);
          toast({
            title: "Ticket Created",
            description: "Our support team will be in touch soon.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create support ticket.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-forest text-white rounded-full shadow-xl flex items-center justify-center hover:bg-brand-sage transition-colors focus:outline-none focus:ring-4 focus:ring-brand-light/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        initial={false}
        animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-forest p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-white">BDE Support</h3>
                  <p className="text-xs text-white/70">AI Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-brand-forest text-white rounded-br-sm' 
                        : 'bg-white border border-border text-foreground shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-brand-light rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-brand-light rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-brand-light rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              
              {/* Escalation Form */}
              {showEscalationForm && (
                <div className="bg-earth-cream border border-earth-tan/30 rounded-xl p-4 mt-4 shadow-sm">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-earth-brown shrink-0" />
                    <p className="text-sm text-earth-brown font-medium">Would you like to speak with our human team?</p>
                  </div>
                  <form onSubmit={handleEscalate} className="space-y-3">
                    <Input 
                      placeholder="Your Name" 
                      value={ticketName} 
                      onChange={e => setTicketName(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <Input 
                      type="email" 
                      placeholder="Email Address" 
                      value={ticketEmail} 
                      onChange={e => setTicketEmail(e.target.value)}
                      required
                      className="bg-white"
                    />
                    <Input
                      placeholder="Subject (optional — we'll use your message if blank)"
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      className="bg-white text-xs"
                    />
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 text-xs"
                        onClick={() => setShowEscalationForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 text-xs bg-brand-forest hover:bg-brand-sage"
                        disabled={ticketMutation.isPending}
                      >
                        {ticketMutation.isPending ? "Sending..." : "Create Ticket"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-border shrink-0">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="pr-12 py-6 bg-secondary/50 border-transparent focus-visible:ring-brand-light/30 rounded-xl"
                  disabled={chatMutation.isPending || showEscalationForm}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-1.5 w-9 h-9 rounded-lg bg-brand-forest hover:bg-brand-sage text-white shadow-sm"
                  disabled={!input.trim() || chatMutation.isPending || showEscalationForm}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
              <div className="text-center mt-2">
                <button 
                  onClick={() => setShowEscalationForm(true)}
                  className="text-[10px] text-muted-foreground hover:text-brand-forest underline"
                  type="button"
                >
                  Speak to a human
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
