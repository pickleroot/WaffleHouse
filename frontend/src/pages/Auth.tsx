import {supabase} from "@/lib/supabase"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {useNavigate} from "react-router-dom";

export default function Auth() {
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [hasAccount, setHasAccount] = useState<boolean>(false);
    const navigate = useNavigate();


    const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const { error } = hasAccount
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert(error.message);
        } else {
            // alert(hasAccount ? 'Check your email for the confirmation link!' : 'Logged in successfully!');
            navigate("/");
          
        }
        setLoading(false);
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{hasAccount ? 'Create Account' : 'Welcome Back'}</CardTitle>
                    <CardDescription>
                        {hasAccount ? 'Sign up to get started' : 'Sign in to your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Processing...' : hasAccount ? 'Sign Up' : 'Login'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <span>
                                {hasAccount ? 'Already have an account?' : 'Need an account?'}
                            </span>
                            <Button 
                                variant="link"
                                onClick={() => setHasAccount(!hasAccount)}
                                className="p-0 h-auto text-sm"
                            >
                                {hasAccount ? 'Login' : 'Sign Up'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}