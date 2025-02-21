// expoApp/app/appointmentHistory.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const response = await axios.get(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/appointments/history',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(response.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load appointment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.details}>{item.details || 'No details available'}</Text>
    </View>
  );

  return (
    <ImageBackground source={require('../assets/appointment_bg.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Appointment History</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : appointments.length > 0 ? (
          <FlatList data={appointments} keyExtractor={(item) => item._id} renderItem={renderItem} />
        ) : (
          <Text style={styles.empty}>No appointment history found.</Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, padding: 20, backgroundColor: 'rgba(255,255,255,0.8)' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  date: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  details: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888' },
});
