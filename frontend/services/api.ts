import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.10:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Safe AsyncStorage wrapper
const safeStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage getItem error:', error);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage removeItem error:', error);
    }
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await safeStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      await safeStorage.removeItem('token');
      await safeStorage.removeItem('userType');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (userData: any) => api.post('/auth/signup', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  facultyLogin: (credentials: any) => api.post('/auth/faculty/login', credentials),
  facultySignup: (facultyData: any) => api.post('/auth/faculty/signup', facultyData),
  getMe: () => api.get('/auth/me'),
  getFacultyMe: () => api.get('/auth/faculty/me'),
};

// Club APIs
export const clubAPI = {
  getClubs: () => api.get('/clubs'),
  getClub: (id: number) => api.get(`/clubs/${id}`),
  createClub: (clubData: any) => api.post('/clubs', clubData),
  updateClub: (id: number, clubData: any) => api.put(`/clubs/${id}`, clubData),
  deleteClub: (id: number) => api.delete(`/clubs/${id}`),
};

// Event APIs
export const eventAPI = {
  getEvents: () => api.get('/events'),
  getEvent: (id: number) => api.get(`/events/${id}`),
  createEvent: (eventData: any) => api.post('/events', eventData),
  updateEvent: (id: number, eventData: any) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id: number) => api.delete(`/events/${id}`),
  getEventSlots: (id: number) => api.get(`/events/${id}/slots`),
  submitForApproval: (id: number) => api.post(`/events/${id}/submit-for-approval`),
};

// Faculty APIs
export const facultyAPI = {
  getPendingEvents: () => api.get('/faculty/events/pending'),
  getReviewedEvents: () => api.get('/faculty/events/reviewed'),
  getAllEvents: () => api.get('/faculty/events/all'),
  reviewEvent: (id: number, reviewData: any) => api.patch(`/faculty/events/${id}`, reviewData),
  getMe: () => api.get('/auth/faculty/me'),
};

// Booking APIs
export const bookingAPI = {
  bookSlot: (bookingData: any) => api.post('/bookings/book-slot', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getAllBookings: () => api.get('/bookings/all-bookings'),
  deleteBooking: (id: number) => api.delete(`/bookings/${id}`),
};

export default api;
