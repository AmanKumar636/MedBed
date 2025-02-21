// expoApp/app/hospitalDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function HospitalDashboard() {
  const router = useRouter();
  const [hospitalData, setHospitalData] = useState(null);
  const [updates, setUpdates] = useState({ bedsAvailable: '', oxygenCylinders: '' });
  const [locationUpdates, setLocationUpdates] = useState({ lat: '', lng: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        const res = await axios.get('https://medbed-server-234a8467fad2.herokuapp.com/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        setHospitalData(res.data);
        setUpdates({
          bedsAvailable: String(res.data.bedsAvailable),
          oxygenCylinders: String(res.data.oxygenCylinders)
        });
        if (res.data.location && res.data.location.coordinates.length === 2) {
          setLocationUpdates({
            lat: String(res.data.location.coordinates[1]),
            lng: String(res.data.location.coordinates[0])
          });
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load hospital data: ' + err.message);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateResources = async () => {
    if (!hospitalData) return;
    setIsUpdating(true);
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const payload = {
        bedsAvailable: parseInt(updates.bedsAvailable) || 0,
        oxygenCylinders: parseInt(updates.oxygenCylinders) || 0,
      };
      const res = await axios.patch(
        `https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals/${hospitalData._id}/update-resources`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHospitalData(res.data.hospital);
      Alert.alert('Success', 'Resources updated successfully');
    } catch (err) {
      Alert.alert('Update Error', err.response?.data?.message || 'Failed to update resources');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission not granted');
      const loc = await Location.getCurrentPositionAsync();
      const payload = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      const res = await axios.patch(
        `https://medbed-server-234a8467fad2.herokuapp.com/api/hospitals/${hospitalData._id}/update-location`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHospitalData(res.data.hospital);
      setLocationUpdates({ lat: String(loc.coords.latitude), lng: String(loc.coords.longitude) });
      Alert.alert('Success', 'Location updated successfully');
    } catch (err) {
      Alert.alert('Location Error', err.message);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_data');
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading hospital dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{hospitalData?.name} Dashboard</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Resources</Text>
        <Text>Beds Available: {hospitalData?.bedsAvailable}</Text>
        <Text>Oxygen Cylinders: {hospitalData?.oxygenCylinders}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Resources</Text>
        <TextInput
          style={styles.input}
          placeholder="Available Beds"
          keyboardType="numeric"
          value={updates.bedsAvailable}
          onChangeText={(text) => setUpdates(prev => ({ ...prev, bedsAvailable: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Oxygen Cylinders"
          keyboardType="numeric"
          value={updates.oxygenCylinders}
          onChangeText={(text) => setUpdates(prev => ({ ...prev, oxygenCylinders: text }))}
        />
        <TouchableOpacity style={[styles.button, isUpdating && styles.disabledButton]} onPress={handleUpdateResources} disabled={isUpdating}>
          <Text style={styles.buttonText}>{isUpdating ? 'Updating...' : 'Update Resources'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Location</Text>
        <Text>Current Coordinates: {locationUpdates.lat}, {locationUpdates.lng}</Text>
        <TouchableOpacity style={styles.button} onPress={handleUpdateLocation}>
          <Text style={styles.buttonText}>Update with Current Location</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, color: '#007BFF', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#2c3e50', textAlign: 'center' },
  logoutButton: { backgroundColor: '#e74c3c', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-end', marginBottom: 10 },
  logoutText: { color: '#fff', fontWeight: '600' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 15, color: '#495057' },
  input: { height: 50, borderColor: '#ced4da', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff', fontSize: 16 },
  button: { height: 50, backgroundColor: '#007bff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#6c757d' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
