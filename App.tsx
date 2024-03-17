import Home from './src/screens/Home';
import { BleProvider } from './src/context/bleContext';

export default function App() {
  return (
    <BleProvider>
      <Home />
    </BleProvider>
  );
}
