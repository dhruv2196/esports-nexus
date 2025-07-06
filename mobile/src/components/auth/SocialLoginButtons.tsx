import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { spacing } from '@constants/theme';

export const SocialLoginButtons: React.FC = () => {
  const handleSocialLogin = (provider: string) => {
    Alert.alert(
      'Coming Soon',
      `${provider} login will be available soon!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Button
        mode="outlined"
        onPress={() => handleSocialLogin('Google')}
        icon="google"
        style={styles.button}
      >
        Continue with Google
      </Button>
      
      <Button
        mode="outlined"
        onPress={() => handleSocialLogin('Discord')}
        icon="discord"
        style={styles.button}
      >
        Continue with Discord
      </Button>
      
      <Button
        mode="outlined"
        onPress={() => handleSocialLogin('Riot Games')}
        icon="gamepad-variant"
        style={styles.button}
      >
        Continue with Riot Games
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  button: {
    marginBottom: spacing.sm,
  },
});