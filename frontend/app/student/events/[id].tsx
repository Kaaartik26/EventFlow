import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { eventAPI, bookingAPI } from '../../../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
}

interface Slot {
  slot_start: string;
  slot_end: string;
  remaining_capacity: number;
}

export default function EventDetailScreen() {
  const [event, setEvent] = useState<Event | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const loadEventDetails = useCallback(async () => {
    try {
      const [eventResponse, slotsResponse] = await Promise.all([
        eventAPI.getEvent(parseInt(id)),
        eventAPI.getEventSlots(parseInt(id)),
      ]);
      
      setEvent(eventResponse.data);
      setSlots(slotsResponse.data);
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Error', 'Failed to load event details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBookSlot = async (slot: Slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !event) return;

    try {
      setIsBooking(true);
      
      await bookingAPI.bookSlot({
        event_id: event.id,
        slot_start: selectedSlot.slot_start,
        slot_end: selectedSlot.slot_end,
      });

      Alert.alert('Success', 'Slot booked successfully!');
      setShowBookingModal(false);
      
      // Reload slots to update availability
      loadEventDetails();
    } catch (error: any) {
      Alert.alert('Booking Error', error.response?.data?.detail || 'Failed to book slot');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✅ Approved</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <Text style={styles.description}>{event.description || 'No description available'}</Text>
          
          <View style={styles.details}>
            <Text style={styles.detail}>📅 Start: {formatDateTime(event.start_time)}</Text>
            <Text style={styles.detail}>🏁 End: {formatDateTime(event.end_time)}</Text>
            <Text style={styles.detail}>⏱️ Slot Duration: {event.slot_duration} minutes</Text>
            <Text style={styles.detail}>👥 Max Participants: {event.max_participants}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          
          {slots.length === 0 ? (
            <Text style={styles.noSlots}>No available slots</Text>
          ) : (
            slots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slotCard,
                  slot.remaining_capacity === 0 && styles.disabledSlot,
                ]}
                onPress={() => slot.remaining_capacity > 0 && handleBookSlot(slot)}
                disabled={slot.remaining_capacity === 0}
              >
                <View style={styles.slotHeader}>
                  <Text style={styles.slotTime}>
                    {formatTime(slot.slot_start)} - {formatTime(slot.slot_end)}
                  </Text>
                  <Text style={[
                    styles.slotCapacity,
                    slot.remaining_capacity === 0 && styles.fullCapacity,
                  ]}>
                    {slot.remaining_capacity} / {event.max_participants} spots
                  </Text>
                </View>
                
                {slot.remaining_capacity === 0 ? (
                  <Text style={styles.fullText}>FULL</Text>
                ) : (
                  <Text style={styles.bookText}>Tap to Book</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            
            {selectedSlot && (
              <View style={styles.modalDetails}>
                <Text style={styles.modalEvent}>{event.title}</Text>
                <Text style={styles.modalSlot}>
                  {formatTime(selectedSlot.slot_start)} - {formatTime(selectedSlot.slot_end)}
                </Text>
                <Text style={styles.modalCapacity}>
                  {selectedSlot.remaining_capacity} spots remaining
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmBooking}
                disabled={isBooking}
              >
                <Text style={styles.confirmButtonText}>
                  {isBooking ? 'Booking...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  details: {
    gap: 8,
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledSlot: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  slotCapacity: {
    fontSize: 14,
    color: '#666',
  },
  fullCapacity: {
    color: '#d32f2f',
  },
  bookText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  fullText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
  },
  noSlots: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalSlot: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalCapacity: {
    fontSize: 14,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
