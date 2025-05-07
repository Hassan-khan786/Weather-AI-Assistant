import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSettings } from '../SettingsContext';

interface UnitOption {
  label: string;
  value: string;
}

interface UnitSelectorProps {
  title: string;
  options: UnitOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

interface SwitchSettingProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { 
    tempUnit, 
    windSpeedUnit, 
    pressureUnit,
    distanceUnit,
    timeFormat24h,
    setTempUnit, 
    setWindSpeedUnit,
    setPressureUnit,
    setDistanceUnit,
    setTimeFormat24h
  } = useSettings();
  
  // State for switches
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  // Function to render a unit selector
  const UnitSelector = ({ title, options, selectedValue, onSelect }: UnitSelectorProps) => (
    <View style={styles.unitSection}>
      <Text style={styles.unitTitle}>{title}</Text>
      <View style={styles.unitOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.unitOption,
              selectedValue === option.value && styles.unitOptionSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.unitOptionText,
                selectedValue === option.value && styles.unitOptionTextSelected
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Function to render a switch setting
  const SwitchSetting = ({ title, subtitle, value, onValueChange }: SwitchSettingProps) => (
    <View style={styles.switchSetting}>
      <View>
        <Text style={styles.switchTitle}>{title}</Text>
        {subtitle && <Text style={styles.switchSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        trackColor={{ false: '#3E4B5B', true: '#3E4B5B' }}
        thumbColor={value ? '#007AFF' : '#F4F3F4'}
        ios_backgroundColor="#3E4B5B"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Settings</Text>
        
        {/* Temperature Unit Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature Unit</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, tempUnit === 'Celsius' && styles.activeButton]}
              onPress={() => setTempUnit('Celsius')}
            >
              <Text style={[styles.buttonText, tempUnit === 'Celsius' && styles.activeButtonText]}>
                Celsius
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, tempUnit === 'Fahrenheit' && styles.activeButton]}
              onPress={() => setTempUnit('Fahrenheit')}
            >
              <Text style={[styles.buttonText, tempUnit === 'Fahrenheit' && styles.activeButtonText]}>
                Fahrenheit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wind Speed Unit Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wind Speed Unit</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, windSpeedUnit === 'km/h' && styles.activeButton]}
              onPress={() => setWindSpeedUnit('km/h')}
            >
              <Text style={[styles.buttonText, windSpeedUnit === 'km/h' && styles.activeButtonText]}>
                km/h
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, windSpeedUnit === 'm/s' && styles.activeButton]}
              onPress={() => setWindSpeedUnit('m/s')}
            >
              <Text style={[styles.buttonText, windSpeedUnit === 'm/s' && styles.activeButtonText]}>
                m/s
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, windSpeedUnit === 'knots' && styles.activeButton]}
              onPress={() => setWindSpeedUnit('knots')}
            >
              <Text style={[styles.buttonText, windSpeedUnit === 'knots' && styles.activeButtonText]}>
                knots
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pressure Unit Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pressure Unit</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, pressureUnit === 'hPa' && styles.activeButton]}
              onPress={() => setPressureUnit('hPa')}
            >
              <Text style={[styles.buttonText, pressureUnit === 'hPa' && styles.activeButtonText]}>
                hPa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, pressureUnit === 'inches' && styles.activeButton]}
              onPress={() => setPressureUnit('inches')}
            >
              <Text style={[styles.buttonText, pressureUnit === 'inches' && styles.activeButtonText]}>
                inches
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, pressureUnit === 'kPa' && styles.activeButton]}
              onPress={() => setPressureUnit('kPa')}
            >
              <Text style={[styles.buttonText, pressureUnit === 'kPa' && styles.activeButtonText]}>
                kPa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, pressureUnit === 'mm' && styles.activeButton]}
              onPress={() => setPressureUnit('mm')}
            >
              <Text style={[styles.buttonText, pressureUnit === 'mm' && styles.activeButtonText]}>
                mm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Distance Unit Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance Unit</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, distanceUnit === 'Kilometers' && styles.activeButton]}
              onPress={() => setDistanceUnit('Kilometers')}
            >
              <Text style={[styles.buttonText, distanceUnit === 'Kilometers' && styles.activeButtonText]}>
                Kilometers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, distanceUnit === 'Miles' && styles.activeButton]}
              onPress={() => setDistanceUnit('Miles')}
            >
              <Text style={[styles.buttonText, distanceUnit === 'Miles' && styles.activeButtonText]}>
                Miles
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Notifications</Text>
          <SwitchSetting
            title="Notifications"
            subtitle="Be aware of the weather"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        
        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>General</Text>
          <SwitchSetting
            title="24-Hour Time"
            subtitle="Use 24-hour time format"
            value={timeFormat24h}
            onValueChange={setTimeFormat24h}
          />
          <SwitchSetting
            title="Location"
            subtitle="Get weather of your location"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
          />
        </View>
        
        {/* Add some bottom padding */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2737',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 50,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#162237',
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E9AAF',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#162237',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  activeButton: {
    backgroundColor: '#4DA6FF',
  },
  buttonText: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
  },
  activeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  unitSection: {
    marginBottom: 20,
  },
  unitTitle: {
    fontSize: 12,
    color: '#8E9AAF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unitOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  unitOption: {
    backgroundColor: '#2B3543',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unitOptionSelected: {
    backgroundColor: '#1E2737',
    borderColor: '#007AFF',
  },
  unitOptionText: {
    color: '#8E9AAF',
    fontSize: 14,
    fontWeight: '500',
  },
  unitOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  switchSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2B3543',
  },
  switchTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  switchSubtitle: {
    fontSize: 13,
    color: '#8E9AAF',
    marginTop: 4,
  },
});