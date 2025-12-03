import { useState, useCallback, useRef } from 'react';
interface StreamOptions {
    onChunk?: (chunk: string) => void;
    onDone?: () => void;
    onError?: (error: string) => void;
}
interface UseAIStreamResult {
    data: string;
    isLoading: boolean;
    isStreaming: boolean;
    error: string | null;
    stream: (url: string, body: any) => Promise<void>;
    reset: () => void;
}
export function useAIStream(options: StreamOptions = {}): UseAIStreamResult {
    const [data, setData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const reset = useCallback(() => {
        setData('');
        setError(null);
        setIsLoading(false);
        setIsStreaming(false);
    }, []);
    const stream = useCallback(async (url: string, body: any) => {
        try {
            // Cancel previous request if any
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setIsLoading(true);
            setIsStreaming(true);
            setError(null);
            setData('');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: abortControllerRef.current.signal,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (!response.body) {
                throw new Error('Response body is null');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            setIsLoading(false); // Connection established, now streaming
            while (true) {
                const { value, done } = await reader.read();

                if (done) {
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Process complete lines from buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);

                        try {
                            const parsed = JSON.parse(dataStr);

                            if (parsed.type === 'chunk') {
                                const content = parsed.content;
                                setData(prev => prev + content);
                                options.onChunk?.(content);
                            } else if (parsed.type === 'error') {
                                throw new Error(parsed.error);
                            } else if (parsed.type === 'done') {
                                options.onDone?.();
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE message:', dataStr);
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Stream aborted');
                return;
            }
            setError(err.message);
            options.onError?.(err.message);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, [options]);
    return { data, isLoading, isStreaming, error, stream, reset };
}
