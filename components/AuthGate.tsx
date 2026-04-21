import React from 'react';
import { Redirect, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const PUBLIC_PATHS = ['/sign-in', '/sign-up'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session && !PUBLIC_PATHS.includes(pathname || '')) {
    return <Redirect href="/sign-in" />;
  }

  return <>{children}</>;
}
