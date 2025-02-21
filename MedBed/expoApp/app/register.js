// app/register.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import client from './src/api/client';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

const indianCities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Surat',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Visakhapatnam',
  'Indore',
  'Thane',
  'Bhopal',
  'Patna',
  'Vadodara',
  'Tirupati'
].sort();

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    city: '',
  });
  const [isHospital, setIsHospital] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setFormData({ name: '', email: '', password: '', address: '', city: '' });
        setIsHospital(false);
      };
    }, [])
  );

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name || !emailRegex.test(formData.email) || formData.password.length < 8) {
      Alert.alert(
        'Validation Error',
        'Please check your inputs:\n- Name is required\n- Valid email required\n- Password must be 8+ characters'
      );
      return false;
    }
    if (isHospital && (!formData.address || !formData.city)) {
      Alert.alert('Validation Error', 'Hospital address and city are required');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const endpoint = isHospital ? '/auth/register/hospital' : '/auth/register/user';
      await client.post(endpoint, formData);
      Alert.alert(
        'Registration Successful',
        'You have been registered successfully. Please login to continue.',
        [{ text: 'Go to Login', onPress: () => router.replace('/login') }]
      );
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'An error occurred during registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>{isHospital ? 'Hospital Registration' : 'Patient Registration'}</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(text) => updateFormField('name', text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => updateFormField('email', text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password (8+ characters)"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => updateFormField('password', text)}
          />
        </View>
        {isHospital && (
          <>
            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Hospital Address"
                value={formData.address}
                onChangeText={(text) => updateFormField('address', text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="location-city" size={20} color="#666" style={styles.icon} />
              <Picker
                selectedValue={formData.city}
                onValueChange={(itemValue) => updateFormField('city', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select City" value="" />
                {indianCities.map((city) => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>
          </>
        )}
        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsHospital(!isHospital)}>
          <Text style={styles.toggleText}>Switch to {isHospital ? 'Patient' : 'Hospital'} Registration</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, loading && styles.disabledButton]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Register Now'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollViewContent: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '600', color: '#2c3e50', marginBottom: 40, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#34495e' },
  picker: { flex: 1, height: 50, color: '#34495e' },
  button: { backgroundColor: '#3498db', borderRadius: 10, padding: 15, marginTop: 20 },
  disabledButton: { backgroundColor: '#bdc3c7' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  toggleButton: { marginTop: 15, padding: 10 },
  toggleText: { color: '#3498db', textAlign: 'center', fontWeight: '500' },
});
