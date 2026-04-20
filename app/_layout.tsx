import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { StudentsProvider } from '../context/StudentsContext';
import AuthGate from '../components/AuthGate';

export default function AppLayout() {
  return (
   <AuthProvider>
  <StudentsProvider>
    <AuthGate>
      <Stack />
    </AuthGate>
  </StudentsProvider>
</AuthProvider>
  );
}