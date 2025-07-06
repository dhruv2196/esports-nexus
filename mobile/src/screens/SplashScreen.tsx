import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Logo } from '@components/common/Logo';
import { colors, spacing } from '@constants/theme';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Logo size={100} />
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loader}
      />
      <Text variant="bodyMedium" style={styles.text}>
        Loading your esports experience...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: spacing.xl,
  },
  text: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
});