import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const AIIcon = ({ color }: { color: string }) => (
  <View style={styles.aiIconContainer}>
    <Text style={[styles.aiText, { color }]}>AI</Text>
    <Ionicons name="sparkles" size={12} color={color} style={styles.sparkle} />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E9AAF',
        tabBarStyle: {
          backgroundColor: '#242F3E',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="cloud" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="list"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color }) => <AIIcon color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="menu" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// Add these styles to your ListScreen and MapScreen components to match the dark theme
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2737',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
});

const styles = StyleSheet.create({
  aiIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: -8,
  },
});