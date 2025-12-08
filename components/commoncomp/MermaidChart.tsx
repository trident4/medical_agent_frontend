import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose'
});

// Global cache for rendered SVGs - persists across component mounts
const svgCache = new Map<string, string>();

export function MermaidChart({ code }: { code: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(() => {
        // Check cache immediately during initialization
        const trimmedCode = code.trim();
        return !svgCache.has(trimmedCode);
    });
    const hasRendered = useRef(false);

    useEffect(() => {
        // Prevent running on every mount if already rendered
        if (hasRendered.current) {
            return;
        }

        const trimmedCode = code.trim();

        // If cached, use it immediately and skip rendering
        if (svgCache.has(trimmedCode)) {
            if (ref.current) {
                ref.current.innerHTML = svgCache.get(trimmedCode)!;
                setIsRendering(false);
                hasRendered.current = true;
            }
            return;
        }

        // Validation checks
        if (!trimmedCode || trimmedCode.length < 20) {
            return;
        }

        const codeWithoutDirectives = trimmedCode.replace(/^%%.*$/gm, '').trim();
        const validTypes = ['pie', 'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'gantt', 'xychart'];
        const hasValidType = validTypes.some(type =>
            trimmedCode.startsWith(type) || codeWithoutDirectives.startsWith(type)
        );

        if (!hasValidType) return;

        const openBrackets = (trimmedCode.match(/\[/g) || []).length;
        const closeBrackets = (trimmedCode.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) return;

        const quotes = (trimmedCode.match(/"/g) || []).length;
        if (quotes % 2 !== 0) return;

        // Render the chart
        setIsRendering(true);
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);

        mermaid.render(id, trimmedCode)
            .then(({ svg }) => {
                // Cache the SVG
                svgCache.set(trimmedCode, svg);

                // Update DOM
                if (ref.current) {
                    ref.current.innerHTML = svg;
                    setIsRendering(false);
                    setError(null);
                    hasRendered.current = true;
                }
            })
            .catch(err => {
                console.error('Mermaid render error:', err);
                setError(err.message);
                setIsRendering(false);
                hasRendered.current = true;
            });
    }, [code]); // Only re-run if code actually changes

    if (error) {
        return (
            <div className="my-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">Chart rendering error: {error}</p>
                <pre className="mt-2 text-xs overflow-auto">{code}</pre>
            </div>
        );
    }

    return (
        <div className="my-4 relative" style={{ minHeight: isRendering ? '300px' : 'auto' }}>
            {isRendering && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded">
                    <div className="text-sm text-zinc-500">Rendering chart...</div>
                </div>
            )}
            <div ref={ref} className={isRendering ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'} />
        </div>
    );
}