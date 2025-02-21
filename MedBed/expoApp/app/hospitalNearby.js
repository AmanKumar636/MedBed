import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Haversine formula to calculate distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number(R * c).toFixed(2);
};

export default function HospitalNearby() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentLocationName, setCurrentLocationName] = useState('Unknown Location');
  const [radius, setRadius] = useState('500'); // radius in km

  const fetchHospitalsNearby = async (coords, radiusInKm) => {
    try {
      const radiusInMeters = parseFloat(radiusInKm) * 1000;
      const { data } = await axios.get(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals/nearby',
        { params: { lat: coords.latitude, lng: coords.longitude, radius: radiusInMeters } }
      );
      // Client-side filtering: ensure we only show hospitals within the radius (in km)
      const filtered = data.data.filter(hospital => {
        const dist = getDistance(coords.latitude, coords.longitude, hospital.location.coordinates[1], hospital.location.coordinates[0]);
        return parseFloat(dist) <= parseFloat(radiusInKm);
      });
      setHospitals(filtered);
    } catch (err) {
      Alert.alert('Error', 'Failed to load nearby hospitals');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationName = async (coords) => {
    try {
      const geocode = await Location.reverseGeocodeAsync(coords);
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const locationName = `${place.name || ''} ${place.street || ''}, ${place.city || place.region || ''}`;
        setCurrentLocationName(locationName.trim());
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  useEffect(() => {
    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Location permission not granted');
        const loc = await Location.getCurrentPositionAsync();
        setCurrentLocation(loc.coords);
        await fetchHospitalsNearby(loc.coords, radius);
        await fetchLocationName(loc.coords);
      } catch (err) {
        setLocationError(err.message);
        setLoading(false);
      }
    };
    initLocation();
  }, [radius]);

  const handleBookBed = async (hospital) => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const response = await axios.patch(
        `https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals/${hospital._id}/book-bed`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Bed Booked Successfully');
      router.push('/appointmentHistory');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to book bed');
    }
  };

  const renderHospital = ({ item }) => {
    const distance = currentLocation
      ? getDistance(currentLocation.latitude, currentLocation.longitude, item.location.coordinates[1], item.location.coordinates[0])
      : 'N/A';
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>Address: {item.address}</Text>
        <Text style={styles.city}>City: {item.city}</Text>
        <Text style={styles.details}>Beds: {item.bedsAvailable} | Oxygen: {item.oxygenCylinders}</Text>
        <Text style={styles.coordinates}>Coordinates: ({item.location.coordinates[1]}, {item.location.coordinates[0]})</Text>
        <Text style={styles.distance}>Distance: {distance} km</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleBookBed(item)}>
          <Text style={styles.buttonText}>Book Bed</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <View style={styles.currentLocationContainer}>
          <Text style={styles.currentLocation}>
            Your Coordinates: ({currentLocation.latitude}, {currentLocation.longitude})
          </Text>
          <Text style={styles.currentLocationName}>Location: {currentLocationName}</Text>
        </View>
      )}
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Search Radius (km):</Text>
        <TextInput style={styles.radiusInput} value={radius} onChangeText={setRadius} keyboardType="numeric" />
      </View>
      <TouchableOpacity style={styles.searchButton} onPress={() => {
        if (currentLocation) {
          setLoading(true);
          fetchHospitalsNearby(currentLocation, radius);
        }
      }}>
        <Text style={styles.searchButtonText}>Update Search Radius</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Nearby Hospitals</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : locationError ? (
        <Text style={styles.error}>{locationError}</Text>
      ) : (
        <FlatList
          data={hospitals}
          keyExtractor={(item) => item._id}
          renderItem={renderHospital}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No hospitals found within the search radius.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  currentLocationContainer: { marginBottom: 10, alignItems: 'center' },
  currentLocation: { fontSize: 16, fontWeight: '600' },
  currentLocationName: { fontSize: 16, fontStyle: 'italic', color: '#555' },
  radiusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  radiusLabel: { fontSize: 16, marginRight: 10 },
  radiusInput: { borderColor: '#ccc', borderWidth: 1, padding: 5, width: 80, textAlign: 'center', borderRadius: 5 },
  searchButton: { backgroundColor: '#007BFF', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  searchButtonText: { color: 'white', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  address: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  city: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  details: { fontSize: 14, color: '#3498db', marginBottom: 5 },
  coordinates: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  distance: { fontSize: 14, color: '#333', marginBottom: 10 },
  button: { backgroundColor: '#2ecc71', borderRadius: 8, padding: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  empty: { textAlign: 'center', color: '#7f8c8d', fontSize: 16, marginTop: 20 },
  error: { textAlign: 'center', color: 'red', fontSize: 16 },
});
