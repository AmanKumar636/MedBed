import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import client from './src/api/client';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const [isHospitalLogin, setIsHospitalLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'All fields are required');
      return false;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const endpoint = isHospitalLogin ? '/auth/login/hospital' : '/auth/login/user';
      const response = await client.post(endpoint, {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      // Save token and user data
      await Promise.all([
        SecureStore.setItemAsync('access_token', response.data.token),
        SecureStore.setItemAsync(
          'user_data',
          JSON.stringify({
            userId: response.data.userId,
            userType: response.data.userType,
            email,
          })
        ),
      ]);
      // Navigate to appropriate dashboard based on user type
      router.replace(response.data.userType === 'hospital' ? '/hospitalDashboard' : '/dashboard');
    } catch (error) {
      console.error('Login failure:', error.response?.data || error.message);
      Alert.alert('Authentication Failed', error.response?.data?.message || 'Check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F0F4FF', '#D6E4FF']} style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View entering={FadeInUp.duration(800)}>
            <Image source={require('../assets/medical-logo.png')} style={styles.logo} />
            <Text style={styles.header}>Welcome to MedBed</Text>
            <Text style={styles.subHeader}>Continue your medical journey</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.formContainer}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !isHospitalLogin && styles.activeToggle]}
                onPress={() => setIsHospitalLogin(false)}
              >
                <FontAwesome name="user-md" size={20} color={!isHospitalLogin ? '#fff' : '#3182CE'} />
                <Text style={[styles.toggleText, !isHospitalLogin && styles.activeToggleText]}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isHospitalLogin && styles.activeToggle]}
                onPress={() => setIsHospitalLogin(true)}
              >
                <MaterialIcons name="local-hospital" size={24} color={isHospitalLogin ? '#fff' : '#3182CE'} />
                <Text style={[styles.toggleText, isHospitalLogin && styles.activeToggleText]}>Hospital</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <MaterialIcons name="email" size={20} color="#4A5568" />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <MaterialIcons name="lock-outline" size={20} color="#4A5568" />
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>New to MedBed?</Text>
              <Link href="/register" style={styles.registerLink}>
                Create {isHospitalLogin ? 'Hospital' : 'Patient'} Account
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 50 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  header: { fontSize: 32, fontWeight: '700', color: '#2D3748', textAlign: 'center', marginBottom: 8 },
  subHeader: { fontSize: 16, color: '#718096', textAlign: 'center', marginBottom: 40 },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#1A202C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  toggleContainer: { flexDirection: 'row', borderRadius: 12, backgroundColor: '#EBF4FF', marginBottom: 24, padding: 4 },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  activeToggle: { backgroundColor: '#3182CE' },
  toggleText: { fontSize: 16, color: '#3182CE' },
  activeToggleText: { color: '#FFFFFF' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  input: { flex: 1, fontSize: 16, color: '#1A202C' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#3182CE' },
  button: { backgroundColor: '#3182CE', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16 }
});
