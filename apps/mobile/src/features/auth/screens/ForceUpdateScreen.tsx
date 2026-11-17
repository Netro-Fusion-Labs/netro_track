import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/ThemeProvider';
import { typography } from '../../../shared/theme/typography';
import { BrandLogo, Button } from '../../../shared/components';
import { APP_BUILD, APP_VERSION } from '../../../shared/constants/appVersion';

interface Props {
  minVersion: string;
  storeUrl?: string | null;
}

export function ForceUpdateScreen({ minVersion, storeUrl }: Props) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.surface.background }]}>
      <View style={styles.content}>
        <BrandLogo variant="mark" size={64} />
        <Text style={[typography.headingMd, { color: theme.colors.text.primary, marginTop: 24, textAlign: 'center' }]}>
          Update required
        </Text>
        <Text style={[typography.bodySm, { color: theme.colors.text.secondary, marginTop: 8, textAlign: 'center' }]}>
          This device is on App {APP_VERSION} (build {APP_BUILD}). Please update to {minVersion} or newer to continue.
        </Text>
        {storeUrl ? (
          <Button
            label="Open store"
            onPress={() => {
              void Linking.openURL(storeUrl);
            }}
            variant="primary"
            size="lg"
            fullWidth
            style={{ marginTop: 24 }}
          />
        ) : (
          <Text style={[typography.caption, { color: theme.colors.text.tertiary, marginTop: 24, textAlign: 'center' }]}>
            Install the latest NetroTrack build from your organisation.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
