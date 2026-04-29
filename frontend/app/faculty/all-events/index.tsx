import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { facultyAPI } from '../../../services/api';

interface Event {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  status: string;
}

export default function FacultyAllEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadEvents = async () => {
    try {
      const response = await facultyAPI.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading all events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Events</Text>
        <Text style={styles.subtitle}>Complete faculty review queue</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No events found</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadEvents();
              }}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/faculty/events/[id]',
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.description}>{item.description || 'No description available'}</Text>
              <Text style={styles.detail}>Status: {item.status}</Text>
              <Text style={styles.detail}>Start: {new Date(item.start_time).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF9800',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  cardTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#555',
    marginBottom: 10,
  },
  detail: {
    color: '#666',
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
  },
});
