import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { facultyAPI } from '../../services/api';
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

export default function FacultyDashboard() {
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  const loadPendingEvents = async () => {
    try {
      const response = await facultyAPI.getPendingEvents();
      setPendingEvents(response.data);
    } catch (error) {
      console.error('Error loading pending events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Faculty Dashboard</Text>
        <Text style={styles.subtitle}>Review Event Proposals</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingEvents.length}</Text>
          <Text style={styles.statLabel}>Pending Events</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/faculty/pending')}
        >
          <Text style={styles.actionIcon}>⏳</Text>
          <Text style={styles.actionTitle}>Pending Events</Text>
          <Text style={styles.actionDescription}>
            Review events awaiting approval
          </Text>
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{pendingEvents.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/faculty/reviewed')}
        >
          <Text style={styles.actionIcon}>✅</Text>
          <Text style={styles.actionTitle}>Reviewed Events</Text>
          <Text style={styles.actionDescription}>
            View approved and rejected events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/faculty/all-events')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>All Events</Text>
          <Text style={styles.actionDescription}>
            View complete event history
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/faculty/profile')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionTitle}>Profile</Text>
          <Text style={styles.actionDescription}>
            View your faculty profile
          </Text>
        </TouchableOpacity>
      </View>

      {pendingEvents.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Pending Events</Text>
          
          {pendingEvents.slice(0, 3).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() =>
                router.push({
                  pathname: '/faculty/events/[id]',
                  params: { id: event.id },
                })
              }
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventClub}>
                🏛️ {event.club?.name || 'Unknown Club'}
              </Text>
              <Text style={styles.eventTime}>
                📅 {formatDate(event.start_time)} at {formatTime(event.start_time)}
              </Text>
            </TouchableOpacity>
          ))}
          
          {pendingEvents.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/faculty/pending')}
            >
              <Text style={styles.viewAllText}>
                View all {pendingEvents.length} pending events
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  header: {
    backgroundColor: '#FF9800',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  actionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  recentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventClub: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
  },
});
