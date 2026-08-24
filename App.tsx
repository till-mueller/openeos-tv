import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { init } from '@noriginmedia/norigin-spatial-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Initialize i18n
import '@/i18n';

// Import hooks
import { useTheme } from '@/hooks/useTheme';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { useDeviceSocket } from '@/hooks/useDeviceSocket';

// Import components
import { ErrorBoundary } from '@/components/common';

// Import stores
import { useDeviceStore } from '@/stores';

// Import screens
import {
  DeviceRegisterScreen,
  DeviceVerificationScreen,
  DisplayModeSelectScreen,
  SettingsScreen,
  MenuScreen,
  KitchenScreen,
  DeliveryScreen,
  PickupScreen,
  SalesScreen,
} from '@/screens';

import type { RootStackParamList } from '@/types';

// Initialize spatial navigation for TV
init({
  debug: __DEV__,
  visualDebug: __DEV__,
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5000,
    },
  },
});

// Create stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation content component
const NavigationContent: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { status, deviceToken, restoreToken } = useDeviceStore();

  // Restore token on mount
  useEffect(() => {
    restoreToken();
  }, [restoreToken]);

  // Start heartbeat and socket connection
  useHeartbeat();
  useDeviceSocket();

  // Determine initial route based on device state
  const getInitialRoute = (): keyof RootStackParamList => {
    if (!deviceToken) {
      return 'DeviceRegister';
    }
    if (status === 'pending') {
      return 'DeviceVerification';
    }
    if (status === 'verified') {
      return 'DisplayModeSelect';
    }
    return 'DeviceRegister';
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.error,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium: { fontFamily: 'System', fontWeight: '500' },
            bold: { fontFamily: 'System', fontWeight: '700' },
            heavy: { fontFamily: 'System', fontWeight: '900' },
          },
        }}>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}>
          {/* Registration Flow */}
          <Stack.Screen
            name="DeviceRegister"
            component={DeviceRegisterScreen}
          />
          <Stack.Screen
            name="DeviceVerification"
            component={DeviceVerificationScreen}
          />
          <Stack.Screen
            name="DisplayModeSelect"
            component={DisplayModeSelectScreen}
          />

          {/* Display Screens */}
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Kitchen" component={KitchenScreen} />
          <Stack.Screen name="Delivery" component={DeliveryScreen} />
          <Stack.Screen name="Pickup" component={PickupScreen} />
          <Stack.Screen name="Sales" component={SalesScreen} />

          {/* Settings */}
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
