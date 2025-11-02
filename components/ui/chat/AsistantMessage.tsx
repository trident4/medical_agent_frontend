import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AssistantMessage({ data }: { data: any }) {
  return (
    <div className="p-3 rounded-md bg-gray-50 border dark:bg-zinc-900 dark:border-zinc-800">
      {/* Markdown Answer */}
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.answer}</ReactMarkdown>
      </div>

      {/* Meta Info */}
      <div className="mt-3 text-xs text-zinc-500 space-y-1">
        <div>🧠 Confidence: {data.confidence_score ?? "N/A"}</div>
        {data.generated_at && (
          <div>
            🕒 Generated at: {new Date(data.generated_at).toLocaleString()}
          </div>
        )}
        {data.sources?.length > 0 && (
          <div>
            📚 Sources:
            <ul className="list-disc ml-5">
              {data.sources.map((src: any, i: number) => (
                <li key={i}>
                  {src.type}: {src.content}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
