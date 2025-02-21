// app/hospital-map.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function HospitalMap() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHospitals = async (coords) => {
    try {
      const { data } = await axios.get(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals/nearby',
        { params: { lat: coords.latitude, lng: coords.longitude } }
      );
      if (data?.data?.length > 0) {
        setHospitals(data.data);
      } else {
        const allRes = await axios.get(
          'https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals'
        );
        setHospitals(allRes.data);
        setError('Showing all available hospitals');
      }
    } catch (err) {
      setError('Failed to load hospitals');
      const allRes = await axios.get(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals'
      );
      setHospitals(allRes.data);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Location permission required');
        const loc = await Location.getCurrentPositionAsync();
        setLocation(loc.coords);
        await fetchHospitals(loc.coords);
      } catch (err) {
        setError(err.message);
        await fetchHospitals({ latitude: 0, longitude: 0 });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Locating hospitals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 20.5937,
          longitude: location?.longitude || 78.9629,
          latitudeDelta: 15,
          longitudeDelta: 15,
        }}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        {hospitals.map(hospital => (
          <Marker
            key={hospital._id}
            coordinate={{
              latitude: hospital.location.coordinates[1],
              longitude: hospital.location.coordinates[0],
            }}
            pinColor={hospital.bedsAvailable > 0 ? '#2ecc71' : '#e74c3c'}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <Text style={styles.detail}>Beds: {hospital.bedsAvailable}</Text>
                <Text style={styles.detail}>Oxygen: {hospital.oxygenCylinders}</Text>
                {hospital.bedsAvailable > 0 && (
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => router.push({
                      pathname: '/appointment',
                      params: { hospital: JSON.stringify(hospital) }
                    })}
                  >
                    <Text style={styles.bookText}>Book Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#007BFF' },
  callout: { backgroundColor: 'white', padding: 10, borderRadius: 8, width: 200 },
  hospitalName: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  detail: { fontSize: 14, color: '#666', marginBottom: 3 },
  bookButton: { backgroundColor: '#2ecc71', padding: 5, borderRadius: 5, marginTop: 5 },
  bookText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  errorBox: { position: 'absolute', bottom: 20, backgroundColor: '#ffebee', padding: 10, borderRadius: 8, alignSelf: 'center' },
  errorText: { color: '#d32f2f' },
});
