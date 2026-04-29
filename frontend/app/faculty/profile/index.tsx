import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../../../context/AuthContext';

export default function FacultyProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const department = user && 'department' in user ? user.department : 'N/A';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.initial}>{user?.name?.charAt(0)?.toUpperCase() || 'F'}</Text>
        <Text style={styles.name}>{user?.name || 'Faculty'}</Text>
        <Text style={styles.email}>{user?.email || 'faculty@example.com'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <Text style={styles.detail}>Role: Faculty</Text>
          <Text style={styles.detail}>Department: {department}</Text>
          <Text style={styles.detail}>
            Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  initial: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    color: '#FF9800',
    textAlign: 'center',
    lineHeight: 72,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
