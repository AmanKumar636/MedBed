// app/hospital-list.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function HospitalListScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    try {
      const { data } = await axios.get(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHospitals(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, []);

  const handleBook = async (hospitalId) => {
    try {
      const { data } = await axios.patch(
        `https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals/${hospitalId}/book-bed`,
        { beds: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHospitals(hospitals.map(h => 
        h._id === hospitalId ? { ...h, bedsAvailable: data.bedsAvailable } : h
      ));
      router.push({
        pathname: '/appointment',
        params: { hospital: JSON.stringify(data.hospital) }
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={hospitals}
      contentContainerStyle={styles.list}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.address}>{item.address}</Text>
          <View style={styles.stats}>
            <Text style={styles.stat}>🛏 {item.bedsAvailable} Beds</Text>
            <Text style={styles.stat}>💨 {item.oxygenCylinders} Oxygen</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, item.bedsAvailable <= 0 && styles.disabled]}
            onPress={() => handleBook(item._id)}
            disabled={item.bedsAvailable <= 0}
          >
            <Text style={styles.buttonText}>
              {item.bedsAvailable > 0 ? 'Book Bed' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No hospitals found</Text>}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 2 },
  name: { fontSize: 18, fontWeight: '600', color: '#2c3e50', marginBottom: 5 },
  address: { fontSize: 14, color: '#7f8c8d', marginBottom: 10 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  stat: { fontSize: 16, color: '#3498db' },
  button: { backgroundColor: '#2ecc71', borderRadius: 8, padding: 15, alignItems: 'center' },
  disabled: { backgroundColor: '#95a5a6' },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  empty: { textAlign: 'center', color: '#7f8c8d', marginTop: 50, fontSize: 16 },
});
