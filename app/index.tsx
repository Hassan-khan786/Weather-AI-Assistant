import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://img.icons8.com/ios-filled/100/4DA6FF/umbrella.png' }}
        style={styles.umbrella}
      />
      <Text style={styles.title}>Breeze</Text>
      <Text style={styles.subtitle}>Weather App</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="arrow-forward" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1127',
    alignItems: 'center',
    justifyContent: 'center',
  },
  umbrella: {
    width: 100,
    height: 100,
    marginBottom: 50,
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#A0A0A0',
    marginBottom: 35,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    elevation: 4,
  },
}); 