import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { facultyAPI } from '../../../services/api';

interface Event {
  id: number;
  title: string;
  description?: string;
  club_id: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_participants: number;
  status: string;
  rejection_comment?: string;
}

export default function FacultyEventDetailsScreen() {
  const [event, setEvent] = useState<Event | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const loadEvent = useCallback(async () => {
    try {
      const eventId = Number(id);
      if (!Number.isFinite(eventId)) {
        throw new Error('Invalid event id');
      }

      const response = await facultyAPI.getEvent(eventId);
      setEvent(response.data);
      setComment(response.data.rejection_comment || '');
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

  const reviewEvent = async (status: 'approved' | 'rejected') => {
    if (!event) return;

    if (status === 'rejected' && !comment.trim()) {
      Alert.alert('Error', 'Please enter a rejection reason');
      return;
    }

    try {
      setIsReviewing(true);
      await facultyAPI.reviewEvent(event.id, {
        status,
        comment: status === 'rejected' ? comment.trim() : undefined,
      });
      Alert.alert('Success', `Event ${status}`);
      loadEvent();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to review event');
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF9800" />
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
        </View>

        {event.status === 'pending' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Review</Text>
            <TextInput
              style={styles.input}
              placeholder="Rejection reason"
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => reviewEvent('approved')}
                disabled={isReviewing}
              >
                <Text style={styles.actionText}>{isReviewing ? 'Working...' : 'Approve'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => reviewEvent('rejected')}
                disabled={isReviewing}
              >
                <Text style={styles.actionText}>{isReviewing ? 'Working...' : 'Reject'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {event.rejection_comment ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rejection Reason</Text>
            <Text style={styles.description}>{event.rejection_comment}</Text>
          </View>
        ) : null}
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
    backgroundColor: '#FF9800',
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
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  detail: {
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 90,
    padding: 12,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionText: {
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
