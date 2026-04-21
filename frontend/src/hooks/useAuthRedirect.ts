import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

/**
 * Redirects to /auth when there is no active session, both on mount
 * and whenever the auth state subsequently changes (e.g., signed out
 * from another tab).
 */
export function useAuthRedirect(redirectTo: string = "/auth") {
    const navigate = useNavigate()

    // Check authentication on mount and redirect if not authenticated
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate(redirectTo);
            }
        };
        checkAuth();
    }, [navigate, redirectTo]);

    // Listen for auth state changes and redirect if logged out
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                navigate(redirectTo);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [navigate, redirectTo]);
}
