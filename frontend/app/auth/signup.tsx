import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [userType, setUserType] = useState<'student' | 'admin' | 'faculty'>('student');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (userType === 'faculty' && !department) {
      Alert.alert('Error', 'Department is required for faculty');
      return;
    }

    try {
      setIsLoading(true);
      
      const userData = {
        name,
        email,
        password,
        ...(userType === 'faculty' && { department }),
      };

      await signup(userData, userType);
      
      // Navigation is handled in the auth context after successful signup
    } catch (error: any) {
      Alert.alert('Signup Error', error.response?.data?.detail || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join EventFlow</Text>

          <View style={styles.userTypeSelector}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'student' && styles.selectedUserType
              ]}
              onPress={() => setUserType('student')}
            >
              <Text style={[
                styles.userTypeText,
                userType === 'student' && styles.selectedUserTypeText
              ]}>
                Student
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'admin' && styles.selectedUserType
              ]}
              onPress={() => setUserType('admin')}
            >
              <Text style={[
                styles.userTypeText,
                userType === 'admin' && styles.selectedUserTypeText
              ]}>
                Admin
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'faculty' && styles.selectedUserType
              ]}
              onPress={() => setUserType('faculty')}
            >
              <Text style={[
                styles.userTypeText,
                userType === 'faculty' && styles.selectedUserTypeText
              ]}>
                Faculty
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {userType === 'faculty' && (
              <TextInput
                style={styles.input}
                placeholder="Department"
                value={department}
                onChangeText={setDepartment}
                autoCapitalize="words"
              />
            )}

            <Button
              title={isLoading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignup}
              disabled={isLoading}
            />

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginText}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  userTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedUserType: {
    backgroundColor: '#2196F3',
  },
  userTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedUserTypeText: {
    color: '#fff',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#2196F3',
    fontSize: 14,
  },
});
