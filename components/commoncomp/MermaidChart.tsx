import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose'
});

export function MermaidChart({ code }: { code: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const trimmedCode = code.trim();

        // Wait until code looks complete
        if (!trimmedCode || trimmedCode.length < 20) {
            return;
        }

        // Remove directives (lines starting with %%) for validation
        const codeWithoutDirectives = trimmedCode.replace(/^%%.*$/gm, '').trim();

        // Check if it starts with a valid diagram type
        const validTypes = ['pie', 'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'gantt', 'xychart'];
        const hasValidType = validTypes.some(type =>
            trimmedCode.startsWith(type) || codeWithoutDirectives.startsWith(type)
        );

        if (!hasValidType) {
            return;
        }

        // Check if all brackets are balanced
        const openBrackets = (trimmedCode.match(/\[/g) || []).length;
        const closeBrackets = (trimmedCode.match(/\]/g) || []).length;

        if (openBrackets !== closeBrackets) {
            return;
        }

        // Check if all quotes are balanced
        const quotes = (trimmedCode.match(/"/g) || []).length;
        if (quotes % 2 !== 0) {
            return;
        }

        if (ref.current) {
            const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
            mermaid.render(id, trimmedCode)
                .then(({ svg }) => {
                    if (ref.current) {
                        ref.current.innerHTML = svg;
                        setError(null);
                    }
                })
                .catch(err => {
                    console.error('Mermaid render error:', err);
                    setError(err.message);
                });
        }
    }, [code]);

    if (error) {
        return (
            <div className="my-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">Chart rendering error: {error}</p>
                <pre className="mt-2 text-xs overflow-auto">{code}</pre>
            </div>
        );
    }

    return <div ref={ref} className="my-4" />;
}