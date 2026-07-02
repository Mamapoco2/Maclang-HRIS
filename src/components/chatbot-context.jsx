import { createContext, useContext, useState, useCallback } from "react";

const ChatbotContext = createContext(null);

export function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  return (
    <ChatbotContext.Provider value={{ isOpen, openChat, closeChat }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used inside ChatbotProvider");
  return ctx;
}
