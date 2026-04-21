import { cn } from "@/lib/utils"
import type { ToastState } from "@/hooks/useToast"

interface ToastProps {
    toast: ToastState | null
}

export default function Toast({ toast }: ToastProps) {
    if (!toast) return null;
    return (
        <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all",
            toast.ok
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
        )}>
            {toast.message}
        </div>
    );
}
