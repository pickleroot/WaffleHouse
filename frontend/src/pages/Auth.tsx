import {supabase} from "@/lib/supabase"
import { use, useState } from "react"

// signup api


export default function Auth() {
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [hasAccount, setHasAccount] = useState<boolean>(false);

    const handleAuth = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = hasAccount
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) {
        alert(error.message);
        } else {
        alert(hasAccount ? 'Check your email for the confirmation link!' : 'Logged in successfully!');
        }
        setLoading(false);
  };

  return(
    <div style={{ maxWidth: '400px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>{hasAccount ? 'Create Account' : 'Welcome Back'}</h2>
      
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : hasAccount ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        {hasAccount ? 'Already have an account?' : 'Need an account?'}
        <button 
          onClick={() => setHasAccount(!hasAccount)} 
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {hasAccount ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}