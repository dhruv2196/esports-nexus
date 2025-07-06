import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@constants/theme';

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleComplete = async () => {
    await AsyncStorage.setItem('@onboarding_completed', 'true');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' as never }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to Esports Nexus
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Your ultimate platform for competitive gaming
        </Text>
        
        <View style={styles.features}>
          <FeatureItem
            icon="🏆"
            title="Join Tournaments"
            description="Compete in exciting tournaments and win prizes"
          />
          <FeatureItem
            icon="👥"
            title="Find Teams"
            description="Connect with players and build your dream team"
          />
          <FeatureItem
            icon="📊"
            title="Track Stats"
            description="Monitor your performance across multiple games"
          />
          <FeatureItem
            icon="🤖"
            title="AI Coaching"
            description="Get personalized tips to improve your gameplay"
          />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleComplete}
        style={styles.button}
      >
        Get Started
      </Button>
    </View>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureText}>
      <Text variant="titleMedium" style={styles.featureTitle}>
        {title}
      </Text>
      <Text variant="bodySmall" style={styles.featureDescription}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: colors.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  features: {
    marginTop: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    color: colors.textSecondary,
  },
  button: {
    paddingVertical: spacing.xs,
  },
});