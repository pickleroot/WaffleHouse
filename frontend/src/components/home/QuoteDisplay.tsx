import { useMemo } from "react"
import { QUOTES } from "@/lib/quotes"

export default function QuoteDisplay() {
    const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
            <blockquote className="max-w-md text-center">
                <p className="text-lg italic text-muted-foreground/60">
                    &ldquo;{quote.text}&rdquo;
                </p>
                <footer className="mt-3 text-sm text-muted-foreground/40">
                    &mdash; {quote.author}
                </footer>
            </blockquote>
        </div>
    );
}
