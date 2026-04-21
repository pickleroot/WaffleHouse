import { useCallback, useState } from "react"

export interface ToastState {
    message: string
    ok: boolean
}

/**
 * Transient notification shown at the top of the page.
 * Cleared automatically after 3 seconds.
 */
export function useToast(durationMs: number = 3000) {
    const [toast, setToast] = useState<ToastState | null>(null)

    const showToast = useCallback((message: string, ok: boolean) => {
        setToast({ message, ok });
        setTimeout(() => setToast(null), durationMs);
    }, [durationMs]);

    return { toast, showToast };
}
