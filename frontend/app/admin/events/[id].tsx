import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { eventAPI } from '../../../services/api';

interface Event {
  id: number;
  title: string;
  description: string;
  club_id: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_participants: number;
  status: string;
  rejection_comment?: string;
  created_at: string;
}

export default function AdminEventDetailsScreen() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const loadEvent = useCallback(async () => {
    try {
      const eventId = Number(id);
      if (!Number.isFinite(eventId)) {
        throw new Error('Invalid event id');
      }

      const response = await eventAPI.getEvent(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const deleteEvent = () => {
    if (!event) return;

    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await eventAPI.deleteEvent(event.id);
            Alert.alert('Success', 'Event deleted');
            router.replace('/admin/events');
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to delete event');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.subtitle}>{event.status.toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.description}>{event.description || 'No description available'}</Text>
          <Text style={styles.detail}>Club ID: {event.club_id}</Text>
          <Text style={styles.detail}>Start: {new Date(event.start_time).toLocaleString()}</Text>
          <Text style={styles.detail}>End: {new Date(event.end_time).toLocaleString()}</Text>
          <Text style={styles.detail}>Slot duration: {event.slot_duration} minutes</Text>
          <Text style={styles.detail}>Max participants: {event.max_participants}</Text>
          {event.rejection_comment ? (
            <Text style={styles.detail}>Rejection reason: {event.rejection_comment}</Text>
          ) : null}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={deleteEvent}>
          <Text style={styles.deleteText}>Delete Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    color: '#555',
    lineHeight: 22,
    marginBottom: 14,
  },
  detail: {
    color: '#555',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
  },
});
