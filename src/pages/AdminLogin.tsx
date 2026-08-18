import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import alfaDriveLogo from '@/assets/alfadrive-logo-raw.png';

export default function AdminLogin() {
  const { signIn, session, loading } = useAuth();
  const { t } = useLanguage();
  const l = t.admin.login;
  const [, navigate] = useLocation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [pending, setPending]   = useState(false);

  useEffect(() => {
    if (!loading && session) navigate('/admin');
  }, [session, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPending(true);
    const { error } = await signIn(email, password);
    setPending(false);
    if (error) setError(error);
    else navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Language switcher — top-right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={alfaDriveLogo}
            alt="AlfaDrive"
            style={{ height: 64, width: 'auto', mixBlendMode: 'screen' }}
          />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <ShieldCheck size={26} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{l.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{l.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                {l.email}
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@alfadrive.ge"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary h-11"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                {l.password}
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary h-11"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold mt-2"
              disabled={pending}
            >
              {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{l.signingIn}</>
              ) : l.signIn}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">{l.footer}</p>
      </motion.div>
    </div>
  );
}
