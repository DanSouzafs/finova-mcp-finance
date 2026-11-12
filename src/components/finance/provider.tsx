import { FinanceProvider } from './components/finance/provider';
import { Workspace } from './components/finance/workspace';

export default function App() {
  return (
    <FinanceProvider>
      <Workspace />
    </FinanceProvider>
  );
}
