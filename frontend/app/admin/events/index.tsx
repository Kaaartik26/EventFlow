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
import { eventAPI, clubAPI } from '../../../services/api';
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

interface Club {
  id: number;
  name: string;
  description: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clubId, setClubId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotDuration, setSlotDuration] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  
  const router = useRouter();

  const loadData = async () => {
    try {
      const [eventsResponse, clubsResponse] = await Promise.all([
        eventAPI.getEvents(),
        clubAPI.getClubs(),
      ]);
      
      setEvents(eventsResponse.data);
      setClubs(clubsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateEvent = async () => {
    if (!title.trim() || !clubId || !startTime || !endTime || !slotDuration || !maxParticipants) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      
      await eventAPI.createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        club_id: parseInt(clubId),
        start_time: startTime,
        end_time: endTime,
        slot_duration: parseInt(slotDuration),
        max_participants: parseInt(maxParticipants),
      });

      Alert.alert('Success', 'Event created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setClubId('');
    setStartTime('');
    setEndTime('');
    setSlotDuration('');
    setMaxParticipants('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅ Approved';
      case 'rejected':
        return '❌ Rejected';
      case 'pending':
        return '⏳ Pending';
      default:
        return status;
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.eventDescription} numberOfLines={2}>
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
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: '/admin/events/[id]',
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton]}
            onPress={() => handleSubmitForApproval(item.id)}
          >
            <Text style={styles.actionButtonText}>Submit for Approval</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleSubmitForApproval = async (eventId: number) => {
    Alert.alert(
      'Submit for Approval',
      'Are you sure you want to submit this event for faculty approval?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await eventAPI.submitForApproval(eventId);
              Alert.alert('Success', 'Event submitted for approval');
              loadData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to submit event');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Events</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create Event</Text>
        </TouchableOpacity>
      </View>
      
      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events found</Text>
          <Text style={styles.emptySubtext}>Create your first event to get started</Text>
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

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ScrollView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Event</Text>
            
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                value={title}
                onChangeText={setTitle}
                autoCapitalize="words"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Club *</Text>
              {clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={[
                    styles.clubOption,
                    clubId === club.id.toString() && styles.selectedClub,
                  ]}
                  onPress={() => setClubId(club.id.toString())}
                >
                  <Text style={[
                    styles.clubOptionText,
                    clubId === club.id.toString() && styles.selectedClubText,
                  ]}>
                    {club.name}
                  </Text>
                </TouchableOpacity>
              ))}

              <TextInput
                style={styles.input}
                placeholder="Start Time (YYYY-MM-DD HH:MM)"
                value={startTime}
                onChangeText={setStartTime}
              />

              <TextInput
                style={styles.input}
                placeholder="End Time (YYYY-MM-DD HH:MM)"
                value={endTime}
                onChangeText={setEndTime}
              />

              <TextInput
                style={styles.input}
                placeholder="Slot Duration (minutes)"
                value={slotDuration}
                onChangeText={setSlotDuration}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Max Participants"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateEvent}
                disabled={isCreating}
              >
                <Text style={styles.confirmButtonText}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
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
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
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
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  clubOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedClub: {
    borderColor: '#2196F3',
    backgroundColor: '#f5f9ff',
  },
  clubOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedClubText: {
    color: '#2196F3',
    fontWeight: '600',
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
