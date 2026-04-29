import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { bookingAPI } from '../../../services/api';

interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  slot_start: string;
  slot_end: string;
  created_at: string;
}

export default function AllBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const formatDateTime = (dateTimeString: string) => new Date(dateTimeString).toLocaleString();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.mutedText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Bookings</Text>
        <Text style={styles.subtitle}>Bookings across every event</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadBookings();
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Booking #{item.id}</Text>
              <Text style={styles.detail}>Event ID: {item.event_id}</Text>
              <Text style={styles.detail}>Student ID: {item.user_id}</Text>
              <Text style={styles.detail}>Slot: {formatDateTime(item.slot_start)}</Text>
              <Text style={styles.detail}>Ends: {formatDateTime(item.slot_end)}</Text>
              <Text style={styles.created}>Created {formatDateTime(item.created_at)}</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 28,
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
    borderLeftColor: '#2196F3',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  created: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  mutedText: {
    marginTop: 12,
    color: '#666',
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
  },
});
