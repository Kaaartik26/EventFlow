import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { facultyAPI } from '../../../services/api';
import { useRouter } from 'expo-router';

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
  created_at: string;
  club?: {
    id: number;
    name: string;
  };
}

export default function PendingEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  
  const router = useRouter();

  const loadPendingEvents = async () => {
    try {
      const response = await facultyAPI.getPendingEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading pending events:', error);
      Alert.alert('Error', 'Failed to load pending events');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingEvents();
  };

  const handleReview = (event: Event, action: 'approve' | 'reject') => {
    setSelectedEvent(event);
    setReviewComment('');
    setShowReviewModal(true);
    
    // Set default comment for rejection
    if (action === 'reject') {
      setReviewComment('');
    }
  };

  const confirmReview = async (action: 'approve' | 'reject') => {
    if (!selectedEvent) return;

    if (action === 'reject' && !reviewComment.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      setIsReviewing(true);
      
      await facultyAPI.reviewEvent(selectedEvent.id, {
        status: action === 'approve' ? 'approved' : 'rejected',
        comment: action === 'reject' ? reviewComment.trim() : undefined,
      });

      Alert.alert(
        'Success',
        `Event ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
      );
      
      setShowReviewModal(false);
      setSelectedEvent(null);
      setReviewComment('');
      loadPendingEvents();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to review event');
    } finally {
      setIsReviewing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventStatus}>⏳ Pending</Text>
      </View>
      
      <Text style={styles.eventDescription} numberOfLines={3}>
        {item.description || 'No description available'}
      </Text>
      
      <Text style={styles.clubName}>🏛️ {item.club?.name || 'Unknown Club'}</Text>
      
      <View style={styles.eventDetails}>
        <Text style={styles.detail}>📅 {formatDate(item.start_time)}</Text>
        <Text style={styles.detail}>⏱️ {item.slot_duration} min slots</Text>
        <Text style={styles.detail}>👥 {item.max_participants} max</Text>
      </View>
      
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleReview(item, 'approve')}
        >
          <Text style={styles.approveButtonText}>✅ Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReview(item, 'reject')}
        >
          <Text style={styles.rejectButtonText}>❌ Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => router.push(`/faculty/events/${item.id}`)}
        >
          <Text style={styles.detailsButtonText}>📋 Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Loading pending events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Events</Text>
        <Text style={styles.subtitle}>Review event proposals</Text>
      </View>
      
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending events</Text>
          <Text style={styles.emptySubtext}>All events have been reviewed</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Event</Text>
            
            {selectedEvent && (
              <View style={styles.eventSummary}>
                <Text style={styles.summaryTitle}>{selectedEvent.title}</Text>
                <Text style={styles.summaryClub}>
                  🏛️ {selectedEvent.club?.name || 'Unknown Club'}
                </Text>
                <Text style={styles.summaryTime}>
                  📅 {formatDate(selectedEvent.start_time)}
                </Text>
              </View>
            )}

            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.reviewButton, styles.approveReviewButton]}
                onPress={() => confirmReview('approve')}
                disabled={isReviewing}
              >
                <Text style={styles.approveReviewButtonText}>
                  {isReviewing ? 'Processing...' : '✅ Approve'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.reviewButton, styles.rejectReviewButton]}
                onPress={() => confirmReview('reject')}
                disabled={isReviewing}
              >
                <Text style={styles.rejectReviewButtonText}>
                  {isReviewing ? 'Processing...' : '❌ Reject'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Rejection Reason (required for rejection)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Enter reason for rejection..."
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowReviewModal(false);
                setSelectedEvent(null);
                setReviewComment('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  eventStatus: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  clubName: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 8,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#E8F5E8',
  },
  approveButtonText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#ffebee',
  },
  rejectButtonText: {
    color: '#d32f2f',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: '#f5f5f5',
  },
  detailsButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  eventSummary: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryClub: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 2,
  },
  summaryTime: {
    fontSize: 12,
    color: '#666',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  reviewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveReviewButton: {
    backgroundColor: '#4CAF50',
  },
  approveReviewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectReviewButton: {
    backgroundColor: '#f44336',
  },
  rejectReviewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 80,
    fontSize: 14,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});
