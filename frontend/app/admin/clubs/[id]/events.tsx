import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { clubAPI, eventAPI } from '../../../../services/api';

interface Club {
  id: number;
  name: string;
  description?: string;
}

interface Event {
  id: number;
  title: string;
  description?: string;
  club_id: number;
  start_time: string;
  status: string;
}

export default function ClubEventsScreen() {
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();

  const loadData = useCallback(async () => {
    try {
      const clubId = Number(id);
      if (!Number.isFinite(clubId)) {
        throw new Error('Invalid club id');
      }

      const [clubResponse, eventsResponse] = await Promise.all([
        clubAPI.getClub(clubId),
        eventAPI.getEvents(),
      ]);

      setClub(clubResponse.data);
      setEvents(eventsResponse.data.filter((event: Event) => event.club_id === clubId));
    } catch (error) {
      console.error('Error loading club events:', error);
      Alert.alert('Error', 'Failed to load club events');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{club?.name || 'Club'} Events</Text>
        <Text style={styles.subtitle}>{events.length} event(s)</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No events for this club</Text>
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
                loadData();
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.description}>{item.description || 'No description available'}</Text>
              <Text style={styles.detail}>Status: {item.status}</Text>
              <Text style={styles.detail}>Start: {new Date(item.start_time).toLocaleString()}</Text>
            </View>
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
    backgroundColor: '#2196F3',
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
