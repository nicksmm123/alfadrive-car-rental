import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { LanguageProvider } from '@/lib/language-provider';
import { AuthProvider } from '@/lib/auth-provider';

// Pages
import Catalog    from '@/pages/Catalog';
import Admin      from '@/pages/Admin';
import AdminLogin from '@/pages/AdminLogin';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/"            component={Catalog}    />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin"       component={Admin}      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
