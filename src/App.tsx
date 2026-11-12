import { Workspace } from "@/components/finance/workspace";
import { FinanceProvider } from "@/components/finance/provider";
import { Toaster } from "sonner";

export default function App() {
  return (
    <FinanceProvider>
      <Workspace view="overview" />
      <Toaster position="top-right" richColors />
    </FinanceProvider>
  );
}
