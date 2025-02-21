import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function FeedbackScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!feedback.trim()) {
      Alert.alert("Validation Error", "Please enter your feedback before submitting.");
      return false;
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      Alert.alert("Validation Error", "Please enter a rating between 1 and 5.");
      return false;
    }
    
    return true;
  };

  const handleSubmitFeedback = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const decodedToken = decodeURIComponent(token);
      await axios.post(
        'https://medbed-server-234a8467fad2.herokuapp.com/api/feedback',
        { 
          feedback: feedback.trim(), 
          rating: rating || null 
        },
        { 
          headers: { 
            'x-auth-token': decodedToken,
            'Content-Type': 'application/json'
          } 
        }
      );

      Alert.alert("Success", "Thank you for your feedback!");
      router.back();
    } catch (error) {
      console.error("Submission Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit feedback. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Share Your Feedback</Text>
        <Text style={styles.subtitle}>Help us improve MedBed</Text>

        <TextInput
          style={styles.input}
          placeholder="Your feedback..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={feedback}
          onChangeText={setFeedback}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Rating (1-5)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={rating}
          onChangeText={(text) => setRating(text.replace(/[^1-5]/g, ''))}
          maxLength={1}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSubmitFeedback}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  button: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});