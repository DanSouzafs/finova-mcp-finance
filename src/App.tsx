import { Workspace } from "@/components/finance/workspace";
import { FinanceProvider, useFinance } from "@/components/finance/provider";
import { AuthScreen } from "@/components/finance/auth";
import { Toaster } from "sonner";

function AppContent() {
  const f = useFinance();

  if (f.showAuthScreen) {
    return (
      <AuthScreen
        initialTab={!f.user ? "signin" : "signup"}
        onBackToApp={() => f.setShowAuthScreen(false)}
      />
    );
  }

  return (
    <Workspace
      view="overview"
      onOpenAuth={() => f.setShowAuthScreen(true)}
    />
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </FinanceProvider>
  );
}
