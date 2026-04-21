import { Github } from "lucide-react"

export default function Footer() {
    return (
        <footer className="h-16 border-t w-full grid grid-cols-3 items-center px-6">

            {/* Left column */}
            <div className="flex items-center justify-start">
                {/* Optional content */}
            </div>

            {/* Center column */}
            <div className="flex items-center justify-center text-sm text-muted-foreground">
                Made by Wade, Tim, Sam, and Ina :D
            </div>

            {/* Right column */}
            <div className="flex items-center justify-end">
                <a
                    href="https://github.com/TS-24/WaffleHouseV1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Github className="h-5 w-5" />
                </a>
            </div>

        </footer>
    );
}