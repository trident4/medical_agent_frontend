"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Virtuoso } from "react-virtuoso";

export default function ChatScreen({
  patientId,
  visitId,
}: {
  patientId: string | null;
  visitId: string | null;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const virtuosoRef = useRef<any>(null);

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
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...questionBody, question: input }),
      });

      const data = await res.json();
      const assistantMessage = { role: "assistant", content: data };
      setMessages((prev) => [...prev, assistantMessage]);

      // Scroll to bottom after response
      setTimeout(
        () =>
          virtuosoRef.current?.scrollToIndex({
            index: messages.length + 1,
            behavior: "smooth",
          }),
        200
      );
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: { answer: "⚠️ Error fetching response." },
        },
      ]);
    } finally {
      setLoading(false);
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
    <div className="flex flex-col h-[90vh] w-full mx-auto border rounded-lg shadow-sm">
      {/* Chat Window */}
      <div className="flex-1">
        <Virtuoso
          ref={virtuosoRef}
          data={messages}
          followOutput="smooth"
          itemContent={(index, msg) => (
            <div
              key={index}
              className={`p-4 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "user" ? (
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-[80%]">
                  {msg.content}
                </div>
              ) : (
                <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg max-w-[80%] prose dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content.answer || msg.content}
                  </ReactMarkdown>

                  {msg.content.confidence_score && (
                    <p className="text-xs text-zinc-500 mt-2">
                      🧠 Confidence: {msg.content.confidence_score}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        />

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 px-4 pb-2 text-zinc-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
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
        />
        <Button onClick={handleSend} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
