import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { MpinScreen } from '../features/auth/screens/MpinScreen';
import { ConsentScreen } from '../features/auth/screens/ConsentScreen';
import { ForceUpdateScreen } from '../features/auth/screens/ForceUpdateScreen';
import { RoleNavigator } from './RoleNavigator';
import { useAuthStore } from '../features/auth/stores/authStore';
import { useConsentStore, isConsentValid } from '../shared/stores/consentStore';
import { useMinAppVersionGate } from '../shared/hooks/useMinAppVersionGate';
import { useTheme } from '../shared/theme/ThemeProvider';

const Stack = createStackNavigator();

function MpinSetupScreen() {
  return <MpinScreen mode="setup" />;
}

function MpinVerifyScreen() {
  return <MpinScreen mode="verify" />;
}

export default function RootNavigator() {
  const theme = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isMpinVerified = useAuthStore((state) => state.isMpinVerified);
  const hasMpin = useAuthStore((state) => state.hasMpin);
  const consentState = useConsentStore();
  const consentAccepted = isConsentValid(consentState);
  const versionGate = useMinAppVersionGate();

  if (versionGate.checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface.background }}>
        <ActivityIndicator color={theme.colors.brand.primary} />
      </View>
    );
  }

  if (versionGate.blocked) {
    return (
      <ForceUpdateScreen minVersion={versionGate.minVersion} storeUrl={versionGate.storeUrl} />
    );
  }

  const authGate = !isAuthenticated
    ? 'login'
    : !isMpinVerified
      ? hasMpin ? 'mpin_verify' : 'mpin_setup'
      : !consentAccepted
        ? 'consent'
        : 'main';

  return (
    <NavigationContainer>
      {/* Remount when auth gate changes so Stack always has exactly one screen tree */}
      <Stack.Navigator key={authGate} screenOptions={{ headerShown: false }}>
        {authGate === 'login' && (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
        {authGate === 'mpin_setup' && (
          <Stack.Screen name="MpinSetup" component={MpinSetupScreen} />
        )}
        {authGate === 'mpin_verify' && (
          <Stack.Screen name="MpinVerify" component={MpinVerifyScreen} />
        )}
        {authGate === 'consent' && (
          <Stack.Screen name="Consent" component={ConsentScreen} />
        )}
        {authGate === 'main' && (
          <Stack.Screen name="Main" component={RoleNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
