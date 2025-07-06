import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 60, showText = true }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoContainer,
          {
            width: size,
            height: size,
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Ionicons name="game-controller" size={size * 0.6} color="#fff" />
      </View>
      {showText && (
        <Text
          variant="headlineSmall"
          style={[styles.text, { color: theme.colors.primary }]}
        >
          Esports Nexus
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    marginTop: 12,
    fontWeight: 'bold',
  },
});