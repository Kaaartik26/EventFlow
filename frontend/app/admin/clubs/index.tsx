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
} from 'react-native';
import { clubAPI } from '../../../services/api';
import { useRouter } from 'expo-router';

interface Club {
  id: number;
  name: string;
  description: string;
  created_by_id: number;
  created_at: string;
}

export default function ClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const router = useRouter();

  const loadClubs = async () => {
    try {
      const response = await clubAPI.getClubs();
      setClubs(response.data);
    } catch (error) {
      console.error('Error loading clubs:', error);
      Alert.alert('Error', 'Failed to load clubs');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadClubs();
  };

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      Alert.alert('Error', 'Please enter a club name');
      return;
    }

    try {
      setIsCreating(true);
      
      await clubAPI.createClub({
        name: clubName.trim(),
        description: clubDescription.trim() || undefined,
      });

      Alert.alert('Success', 'Club created successfully!');
      setShowCreateModal(false);
      setClubName('');
      setClubDescription('');
      loadClubs();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create club');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderClub = ({ item }: { item: Club }) => (
    <View style={styles.clubCard}>
      <View style={styles.clubHeader}>
        <Text style={styles.clubName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => {
            // TODO: Implement club options (edit, delete, view events)
            Alert.alert('Club Options', 'Edit and delete functionality coming soon');
          }}
        >
          <Text style={styles.moreButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.clubDescription}>
        {item.description || 'No description available'}
      </Text>
      
      <View style={styles.clubDetails}>
        <Text style={styles.clubDate}>
          Created: {formatDate(item.created_at)}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.viewEventsButton}
        onPress={() =>
          router.push({
            pathname: '/admin/clubs/[id]/events',
            params: { id: item.id },
          })
        }
      >
        <Text style={styles.viewEventsText}>View Events</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading clubs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Clubs</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create Club</Text>
        </TouchableOpacity>
      </View>
      
      {clubs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No clubs found</Text>
          <Text style={styles.emptySubtext}>Create your first club to get started</Text>
        </View>
      ) : (
        <FlatList
          data={clubs}
          renderItem={renderClub}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Create Club Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Club</Text>
            
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Club Name"
                value={clubName}
                onChangeText={setClubName}
                autoCapitalize="words"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={clubDescription}
                onChangeText={setClubDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setClubName('');
                  setClubDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateClub}
                disabled={isCreating}
              >
                <Text style={styles.confirmButtonText}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  clubCard: {
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
    borderLeftColor: '#2196F3',
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#666',
  },
  clubDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  clubDetails: {
    marginBottom: 12,
  },
  clubDate: {
    fontSize: 12,
    color: '#999',
  },
  viewEventsButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewEventsText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
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
