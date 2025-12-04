"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, ChevronDown, ChevronRight, Database, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Virtuoso } from "react-virtuoso";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAIStream } from "@/hooks/useAIStream";

export default function AnalyticsChat() {
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
                    // Try to parse chunk as JSON (metadata)
                    try {
                        const parsedChunk = JSON.parse(chunk);
                        if (parsedChunk.type === "metadata") {
                            // It's metadata - store it but don't append to explanation
                            const updatedContent = {
                                ...lastMessage.content,
                                sql_query: parsedChunk.sql_query,
                                results: parsedChunk.results,
                                row_count: parsedChunk.row_count,
                                source: parsedChunk.source,
                            };
                            newMessages[lastMessageIndex] = {
                                ...lastMessage,
                                content: updatedContent,
                            };
                            return newMessages;
                        }
                    } catch (e) {
                        // Not JSON - it's explanation text, append it
                        const updatedContent = {
                            ...lastMessage.content,
                            explanation: (lastMessage.content.explanation || "") + chunk,
                        };
                        newMessages[lastMessageIndex] = {
                            ...lastMessage,
                            content: updatedContent,
                        };
                        return newMessages;
                    }
                }
                return prev;
            });
            // Scroll to bottom on new chunk
            virtuosoRef.current?.scrollToIndex({
                index: messages.length,
                behavior: "smooth",
            });
        },
        onDone: (finalData) => {
            // Stream completed
            console.log("Analytics stream completed");
        },
    });

    // Body template for POST call
    const questionBody = { explain: true };

    // Send message
    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);

        const question = input;
        setInput("");

        // Add placeholder assistant message
        setMessages((prev) => [
            ...prev,
            {
                role: "assistant",
                content: { explanation: "" },
            },
        ]);

        try {
            await stream("/api/analytics", {
                ...questionBody,
                question,
            });
        } catch (err) {
            console.error(err);
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: {
                        explanation: "⚠️ Error fetching response.",
                        error: err instanceof Error ? err.message : "Unknown error"
                    },
                };
                return newMessages;
            });
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
        <div className="flex flex-col h-full w-full mx-auto border rounded-lg shadow-sm bg-background">
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
                                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-[80%]">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="bg-muted px-4 py-2 rounded-lg max-w-[90%] w-full prose dark:prose-invert">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content.explanation || "Analyzing..."}
                                    </ReactMarkdown>

                                    {/* Technical Details Collapsible */}
                                    {(msg.content.sql_query || msg.content.results) && (
                                        <div className="mt-4 border-t pt-2">
                                            <TechnicalDetails
                                                sql={msg.content.sql_query}
                                                results={msg.content.results}
                                            />
                                        </div>
                                    )}

                                    {msg.content.error && (
                                        <div className="text-red-500 mt-2 text-sm">
                                            Error: {msg.content.error}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                />

                {/* Loading Indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 px-4 pb-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing data...
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t flex gap-2">
                <Input
                    placeholder="Ask a question about your data (e.g., 'Which patient has the most visits?')"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSend} disabled={isStreaming}>
                    Send
                </Button>
            </div>
        </div>
    );
}

function TechnicalDetails({ sql, results }: { sql?: string, results?: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
            <div className="flex items-center justify-between space-x-4 px-4">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex justify-between p-0 h-auto hover:bg-transparent">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            View Technical Details
                        </span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
                {sql && (
                    <div className="rounded-md bg-zinc-950 p-4 overflow-x-auto">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                            <Database className="h-3 w-3" /> SQL Query
                        </div>
                        <code className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                            {sql}
                        </code>
                    </div>
                )}

                {results && results.length > 0 && (
                    <div className="rounded-md border p-2 bg-card">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Table className="h-3 w-3" /> Raw Results ({results.length} rows)
                        </div>
                        <div className="max-h-60 overflow-auto">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(results, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    )
}
