import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { spacing } from '@constants/theme';

export const HomeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome to Esports Nexus
      </Text>
      
      <Card style={styles.card}>
        <Card.Title title="Upcoming Tournaments" />
        <Card.Content>
          <Text>No tournaments scheduled</Text>
        </Card.Content>
        <Card.Actions>
          <Button>View All</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Your Teams" />
        <Card.Content>
          <Text>You haven't joined any teams yet</Text>
        </Card.Content>
        <Card.Actions>
          <Button>Find Teams</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Recent Matches" />
        <Card.Content>
          <Text>No recent matches</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
});