import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSettings } from '../SettingsContext';
import { useWeather } from '../WeatherContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIScreen() {
  const { weather } = useWeather();
  const { tempUnit } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your weather assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Add function to convert wind speed
  const getWindSpeed = (speed: number) => {
    if (tempUnit === 'Fahrenheit') {
      // Convert m/s to mph (1 m/s = 2.237 mph)
      return Math.round(speed * 2.237);
    }
    // Convert m/s to km/h (1 m/s = 3.6 km/h)
    return Math.round(speed * 3.6);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(input.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (!weather) {
      return "I'm sorry, I don't have access to the current weather data. Please try again later.";
    }

    if (input.includes('temperature') || input.includes('temp') || input.includes('hot') || input.includes('cold')) {
      return `The current temperature is ${Math.round(weather.main.temp)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}. It feels like ${Math.round(weather.main.feels_like)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}.`;
    }

    if (input.includes('rain') || input.includes('precipitation') || input.includes('umbrella')) {
      const isRaining = weather.weather[0].main.toLowerCase().includes('rain');
      return isRaining 
        ? "Yes, there's a chance of rain. I recommend carrying an umbrella."
        : "No rain expected in the near future. You can leave your umbrella at home.";
    }

    if (input.includes('wind') || input.includes('breeze')) {
      return `The current wind speed is ${getWindSpeed(weather.wind.speed)} ${tempUnit === 'Fahrenheit' ? 'mph' : 'km/h'}.`;
    }

    if (input.includes('humidity')) {
      return `The current humidity is ${weather.main.humidity}%.`;
    }

    if (input.includes('forecast') || input.includes('tomorrow') || input.includes('week')) {
      return "I can provide you with weather forecasts. Would you like to know about tomorrow's weather or the weekly forecast?";
    }

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! How can I help you with the weather today?";
    }

    return "I'm not sure I understand. Could you please rephrase your question about the weather?";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Weather Assistant</Text>
        <Text style={styles.subtitle}>Ask me anything about the weather</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color="#4DA6FF" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about the weather..."
            placeholderTextColor="#8E9AAF"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={24} color={input.trim() ? "#4DA6FF" : "#8E9AAF"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2737',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E9AAF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: '#4DA6FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#162237',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#162237',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E2737',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2737',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
