// expoApp/app/chatbot.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ImageBackground } from 'react-native';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  // Basic offline chatbot training on MedBed-related topics.
  const getBotResponse = (msg) => {
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('medbed')) {
      return 'MedBed is an all-in-one app to help you manage hospital appointments and resources efficiently.';
    }
    if (lowerMsg.includes('features')) {
      return 'MedBed lets you search for nearby hospitals, book beds, view your appointment history, and chat for instant support!';
    }
    if (lowerMsg.includes('how to use') || lowerMsg.includes('use')) {
      return 'Simply register or log in, then navigate through the dashboard to find hospitals, book beds, or get help from our chatbot.';
    }
    if (lowerMsg.includes('appointment')) {
      return 'You can book a bed on the Nearby Hospitals screen and then view your appointment history from the Appointments dashboard.';
    }
    if (lowerMsg.includes('feedback')) {
      return 'We value your feedback! Please let us know how we can improve MedBed.';
    }
    if (lowerMsg.includes('help')) {
      return 'I am here to help! You can ask me about how MedBed works or any features you’re curious about.';
    }
    if (lowerMsg.includes('hello')) {
      return 'Hello! How can I help you today?';
    }
    if (lowerMsg.includes('bye')) {
      return 'Goodbye! Have a great day.';
    }
    // Default fallback
    return "I'm sorry, could you please rephrase that?";
  };

  const handleSend = () => {
    if (input.trim()) {
      const userMessage = { id: Date.now().toString(), text: input.trim(), sender: 'user' };
      setMessages((prev) => [...prev, userMessage]);
      const botResponseText = getBotResponse(input.trim());
      const botResponse = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
      setMessages((prev) => [...prev, botResponse]);
      setInput(''); // Clear the input box after sending
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.message, item.sender === 'bot' ? styles.bot : styles.user]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <ImageBackground source={require('../assets/chatbot_bg.jpg')} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesContainer}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, backgroundColor: 'rgba(255,255,255,0.8)' },
  messagesContainer: { padding: 20 },
  message: { marginVertical: 5, padding: 10, borderRadius: 10, maxWidth: '80%' },
  bot: { backgroundColor: '#e1f5fe', alignSelf: 'flex-start' },
  user: { backgroundColor: '#c8e6c9', alignSelf: 'flex-end' },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 15 },
  sendButton: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 },
  sendText: { color: '#007BFF', fontWeight: 'bold' },
});
