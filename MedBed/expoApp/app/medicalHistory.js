// app/medicalHistory.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const response = await axios.get(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/medicalRecords',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecords(response.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.details}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medical Records</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : records.length > 0 ? (
        <FlatList data={records} keyExtractor={(item) => item._id} renderItem={renderItem} />
      ) : (
        <Text style={styles.empty}>No medical records found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  date: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  details: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#888' },
});
