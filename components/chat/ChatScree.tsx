"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Virtuoso } from "react-virtuoso";
import { useAIStream } from "@/hooks/useAIStream";
import { MermaidChart } from "@/components/commoncomp/MermaidChart";


export default function ChatScreen({
  patientId,
  visitId,
}: {
  patientId: number | null;
  visitId: string | null;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const virtuosoRef = useRef<any>(null);

  const { stream, isStreaming, error } = useAIStream({
    onChunk: (chunk) => {
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        const lastMessage = newMessages[lastMessageIndex];

        if (lastMessage && lastMessage.role === "assistant") {
          newMessages[lastMessageIndex] = {
            ...lastMessage,
            content: lastMessage.content + chunk,
          };
          return newMessages;
        }
        return prev;
      });
      // Scroll to bottom on new chunk
      virtuosoRef.current?.scrollToIndex({
        index: messages.length + 1,
        behavior: "smooth",
      });
    },
  });

  // Body template for POST call
  const questionBody = { patient_id: patientId, visit_id: visitId };

  useEffect(() => {
    if (patientId) {
      // Fetch initial messages or any other setup
      setMessages([]);
    }
  }, [patientId, visitId]);

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    // Add user message and a placeholder for assistant message
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" }
    ]);

    const currentInput = input;
    setInput("");

    try {
      await stream("/api/streamchat", { ...questionBody, question: currentInput });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full mx-auto border rounded-lg shadow-sm">
      {/* Chat Window */}
      <div className="flex-1">
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          followOutput="smooth"
          itemContent={(index, msg) => (
            <div
              key={index}
              className={`p-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {msg.role === "user" ? (
                <div className="bg-black text-white px-4 py-2 rounded-lg max-w-[80%]">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg max-w-[80%] prose dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code(props) {
                        const { node, className, children, ...rest } = props;
                        const inline = (props as any).inline;
                        const match = /language-mermaid/.test(className || '');
                        const code = String(children).replace(/\n$/, '');

                        return !inline && match ? (
                          <MermaidChart code={code} />
                        ) : (
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        />

        {/* Loading/Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 px-4 pb-2 text-zinc-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating response...
          </div>
        )}

        {error && (
          <div className="px-4 pb-2 text-red-500 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t flex gap-2">
        <Input
          placeholder="Ask about patient's visit..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
        />
        <Button onClick={handleSend} disabled={isStreaming}>
          Send
        </Button>
      </div>
    </div>
  );
}
