// app/appointment.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token ? decodeURIComponent(params.token) : null;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/appointments',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (token) fetchAppointments(); 
  }, [token]);

  const handleCancel = async (id) => {
    try {
      await axios.delete(
        `https://medbed-server-234a8467fad2.herokuapp.com/api/appointments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(appointments.filter(a => a._id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={appointments}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.hospital}>{item.hospital?.name}</Text>
              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
              <Text style={styles.details}>
                {item.bedsBooked} bed(s) booked
              </Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancel(item._id)}
              >
                <Text style={styles.cancelText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No appointments found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  list: { padding: 15 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 2 },
  hospital: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 5 },
  date: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  details: { fontSize: 16, color: '#3498db', marginBottom: 15 },
  cancelButton: { backgroundColor: '#e74c3c', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelText: { color: 'white', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#7f8c8d', marginTop: 50, fontSize: 16 },
});
