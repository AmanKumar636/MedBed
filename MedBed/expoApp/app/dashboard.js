// expoApp/app/dashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Linking, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import client from './src/api/client';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) throw new Error('No token found');
        const response = await client.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        setUserData(response.data);
      } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        Alert.alert('Session Expired', 'Please login again');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_data');
    router.replace('/login');
  };

  const handleEmergency = async () => {
    try {
      await Linking.openURL('tel:112');
    } catch (error) {
      Alert.alert('Error', 'Unable to make emergency call');
    }
  };

  const handleSupportCall = async () => {
    try {
      await Linking.openURL('tel:9174245164');
    } catch (error) {
      Alert.alert('Error', 'Unable to place support call');
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3182CE" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
      <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome{userData?.name ? `, ${userData.name.split(' ')[0]}` : ''}</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.subGreeting}>How can we help you today?</Text>
          </View>
          <View style={styles.grid}>
            <TouchableOpacity style={[styles.card, styles.mapCard]} onPress={() => navigateTo('/hospitalNearby')}>
              <MaterialCommunityIcons name="map-marker-radius" size={40} color="#FFFFFF" />
              <Text style={styles.cardTitle}>Find Hospitals</Text>
              <Text style={styles.cardText}>Nearby Hospitals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.appointmentCard]} onPress={() => navigateTo('/appointmentHistory')}>
              <MaterialCommunityIcons name="calendar-clock" size={40} color="#FFFFFF" />
              <Text style={styles.cardTitle}>Appointments</Text>
              <Text style={styles.cardText}>Appointment History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.chatbotCard]} onPress={() => navigateTo('/chatbot')}>
              <MaterialCommunityIcons name="robot" size={40} color="#FFFFFF" />
              <Text style={styles.cardTitle}>Chatbot</Text>
              <Text style={styles.cardText}>Instant Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.feedbackCard]} onPress={() => navigateTo('/feedback')}>
              <MaterialCommunityIcons name="message-alert-outline" size={40} color="#FFFFFF" />
              <Text style={styles.cardTitle}>Feedback</Text>
              <Text style={styles.cardText}>Share Your Thoughts</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emergencySection}>
            <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
            <TouchableOpacity style={styles.sosButton} onPress={handleEmergency}>
              <MaterialCommunityIcons name="phone-alert" size={24} color="#FFFFFF" />
              <Text style={styles.sosText}>EMERGENCY SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cust} onPress={handleSupportCall}>
              <MaterialCommunityIcons name="headphones" size={24} color="white" />
              <Text style={styles.sosText}>24/7 Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1, padding: 20 },
  scrollContainer: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, color: '#3182CE', fontSize: 16 },
  header: { marginBottom: 30, paddingHorizontal: 10, alignItems: 'center' },
  greeting: { fontSize: 28, fontWeight: '700', color: '#2D3748', marginBottom: 10 },
  logoutButton: { backgroundColor: '#e74c3c', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 10 },
  logoutText: { color: '#fff', fontWeight: '600' },
  subGreeting: { fontSize: 16, color: '#718096' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  card: { width: '48%', padding: 20, borderRadius: 16, marginBottom: 15, minHeight: 180, justifyContent: 'center', alignItems: 'center' },
  mapCard: { backgroundColor: '#4F46E5' },
  appointmentCard: { backgroundColor: '#10B981' },
  chatbotCard: { backgroundColor: '#F59E0B' },
  feedbackCard: { backgroundColor: '#AA336A' },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginVertical: 10, textAlign: 'center' },
  cardText: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: 14 },
  emergencySection: { marginTop: 20, padding: 20, borderRadius: 16, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center' },
  emergencyTitle: { color: '#EF4444', fontSize: 18, fontWeight: '600', marginBottom: 15 },
  sosButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 35,
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },cust: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 35,
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  sosText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
