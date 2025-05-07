import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSettings } from '../SettingsContext';
import { useWeather } from '../WeatherContext';

// Type definitions
interface City {
  id: string;
  name: string;
  temp: string;
  time: string;
  condition: string;
  details?: WeatherDetails;
}

interface WeatherDetails {
  humidity: number;
  windSpeed: string;
  feelsLike: string;
  pressure: number;
  sunrise: string;
  sunset: string;
  description: string;
  minTemp: string;
  maxTemp: string;
}

// Weather icons component
const WeatherIcon = ({ condition, size = 24 }: { condition: string; size?: number }) => {
  const iconMap = {
    sunny: 'sunny',
    cloudy: 'partly-sunny',
    rainy: 'rainy',
    default: 'partly-sunny'
  };

  const iconName = iconMap[condition as keyof typeof iconMap] || iconMap.default;
  
  return (
    <View style={{ marginRight: 10 }}>
      <Ionicons name={iconName as any} size={size} color="#FDD835" />
    </View>
  );
};

export default function WeatherApp() {
  const { tempUnit, timeFormat24h } = useSettings();
  const { setCity, fetchWeather, city: activeCity } = useWeather();
  const router = useRouter();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<City[]>([
    { id: '1', name: 'Mingora', temp: '--', time: '--', condition: 'sunny' },
    { id: '2', name: 'Peshawar', temp: '--', time: '--', condition: 'sunny' },
    { id: '3', name: 'Islamabad', temp: '--', time: '--', condition: 'sunny' },
    { id: '4', name: 'Lahore', temp: '--', time: '--', condition: 'sunny' },
  ]);
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (timeFormat24h) {
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${period}`;
    }
  };

  const fetchWeatherForCity = async (cityName: string) => {
    try {
      const units = tempUnit === 'Fahrenheit' ? 'imperial' : 'metric';
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=357d7d866cdd4097d43a4e92e52e2220&units=${units}`
      );
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();
      const condition = data.weather[0].main.toLowerCase();
      
      return {
        id: data.id.toString(),
        name: data.name,
        temp: Math.round(data.main.temp) + '°' + (tempUnit === 'Fahrenheit' ? 'F' : 'C'),
        time: formatTime(new Date()),
        condition: condition.includes('rain') ? 'rainy' : condition.includes('cloud') ? 'cloudy' : 'sunny',
        details: {
          humidity: data.main.humidity,
          windSpeed: `${Math.round(data.wind.speed)} ${tempUnit === 'Fahrenheit' ? 'mph' : 'm/s'}`,
          feelsLike: `${Math.round(data.main.feels_like)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}`,
          pressure: data.main.pressure,
          sunrise: formatTime(new Date(data.sys.sunrise * 1000)),
          sunset: formatTime(new Date(data.sys.sunset * 1000)),
          description: data.weather[0].description,
          minTemp: `${Math.round(data.main.temp_min)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}`,
          maxTemp: `${Math.round(data.main.temp_max)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}`
        }
      };
    } catch (err) {
      console.error(`Error fetching weather for ${cityName}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const updateDefaultCities = async () => {
      const defaultCityNames = ['Mingora', 'Peshawar', 'Islamabad', 'Lahore'];
      const updatedCities = await Promise.all(
        defaultCityNames.map(async (cityName) => {
          const weatherData = await fetchWeatherForCity(cityName);
          return weatherData || { id: cityName, name: cityName, temp: '--', time: '--', condition: 'sunny' };
        })
      );
      setCities(updatedCities);
    };

    updateDefaultCities();
  }, []);

  useEffect(() => {
    const updateCityTemperatures = async () => {
      const updatedCities = await Promise.all(
        cities.map(async (city) => {
          if (city.temp === '--') return city;
          const weatherData = await fetchWeatherForCity(city.name);
          return weatherData || city;
        })
      );
      setCities(updatedCities);
    };

    updateCityTemperatures();
  }, [tempUnit]);

  // Add useEffect to update times when timeFormat24h changes
  useEffect(() => {
    const updateTimes = async () => {
      const updatedCities = await Promise.all(
        cities.map(async (city) => {
          if (city.temp === '--') return city;
          const weatherData = await fetchWeatherForCity(city.name);
          return weatherData || city;
        })
      );
      setCities(updatedCities);
    };

    updateTimes();
  }, [timeFormat24h]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchQuery)}&appid=357d7d866cdd4097d43a4e92e52e2220&units=${tempUnit === 'Fahrenheit' ? 'imperial' : 'metric'}`
      );
      if (!res.ok) throw new Error('City not found');
      const data = await res.json();
      const condition = data.weather[0].main.toLowerCase();
      setSearchResults([
        {
          id: data.id.toString(),
          name: data.name,
          temp: Math.round(data.main.temp) + '°' + (tempUnit === 'Fahrenheit' ? 'F' : 'C'),
          time: formatTime(new Date()),
          condition: condition.includes('rain') ? 'rainy' : condition.includes('cloud') ? 'cloudy' : 'sunny',
          details: {
            humidity: data.main.humidity,
            windSpeed: `${Math.round(data.wind.speed)} ${tempUnit === 'Fahrenheit' ? 'mph' : 'm/s'}`,
            feelsLike: `${Math.round(data.main.feels_like)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}`,
            pressure: data.main.pressure,
            sunrise: formatTime(new Date(data.sys.sunrise * 1000)),
            sunset: formatTime(new Date(data.sys.sunset * 1000)),
            description: data.weather[0].description,
            minTemp: `${Math.round(data.main.temp_min)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}`,
            maxTemp: `${Math.round(data.main.temp_max)}°${tempUnit === 'Fahrenheit' ? 'F' : 'C'}`
          }
        },
      ]);
    } catch (err: any) {
      setSearchError(err.message || 'Unknown error');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCancel = (): void => {
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    Keyboard.dismiss();
  };

  const handleRemoveCity = (id: string) => {
    setCities(cities.filter(city => city.id !== id));
  };

  const handleAddCity = (city: City) => {
    if (!cities.some(c => c.id === city.id)) {
      setCities([...cities, { ...city }]);
    }
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  const handleCityPress = async (city: City) => {
    setSelectedCity(city);
    setModalVisible(true);
    
    // If we don't have the details yet, fetch them
    if (!city.details) {
      setDetailsLoading(true);
      const updatedCity = await fetchWeatherForCity(city.name);
      if (updatedCity) {
        setSelectedCity(updatedCity);
        // Also update the city in our list
        setCities(cities.map(c => c.id === city.id ? updatedCity : c));
      }
      setDetailsLoading(false);
    }
  };

  const handleSelectCity = async (city: City) => {
    setCity(city.name);
    await fetchWeather(city.name);
    router.push('/');
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <TouchableOpacity 
      style={styles.cityCard}
      onPress={() => handleSelectCity(item)}
    >
      <View style={styles.cityInfo}>
        <View style={styles.cityNameRow}>
          <Text style={styles.cityName}>{item.name}</Text>
          {item.id === '1' && (
            <Ionicons name="navigate" size={20} color="white" />
          )}
          {item.name === activeCity && (
            <Ionicons name="checkmark-circle" size={20} color="#4DA6FF" style={styles.activeIcon} />
          )}
        </View>
        <Text style={styles.cityTime}>{item.time}</Text>
      </View>
      
      <View style={styles.tempContainer}>
        <WeatherIcon condition={item.condition} size={32} />
        <Text style={styles.temperature}>{item.temp}</Text>
      </View>

      <TouchableOpacity 
        style={styles.removeButton}
        onPress={(e) => {
          e.stopPropagation();
          handleRemoveCity(item.id);
        }}
      >
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSearchResultItem = ({ item }: { item: City }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => handleAddCity(item)}
    >
      <View style={styles.searchResultInfo}>
        <WeatherIcon condition={item.condition} />
        <Text style={styles.searchResultName}>{item.name}</Text>
      </View>
      <Text style={styles.searchResultTemp}>{item.temp}</Text>
    </TouchableOpacity>
  );

  const renderDetailCard = (icon: string, title: string, value: string) => (
    <View style={styles.detailCard}>
      {title === 'Wind' ? (
        <Feather name="wind" size={24} color="#FDD835" />
      ) : (
        <Ionicons name={icon as any} size={24} color="#FDD835" />
      )}
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {!isSearchActive ? (
          <>
            <Text style={styles.title}>My Cities</Text>
            <TouchableOpacity 
              style={styles.searchBar}
              onPress={() => setIsSearchActive(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.searchPlaceholder}>Search for cities</Text>
            </TouchableOpacity>
            
            <FlatList
              data={cities}
              renderItem={renderCityItem}
              keyExtractor={item => item.id}
              style={styles.citiesList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <>
            <View style={styles.searchHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search city..."
                placeholderTextColor="#FFFFFF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {searchLoading ? (
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Searching...</Text>
            ) : searchError ? (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{searchError}</Text>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResultItem}
                keyExtractor={item => item.id}
                style={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        {/* City Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedCity(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedCity(null);
                }}
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>

              {detailsLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading weather details...</Text>
                </View>
              ) : selectedCity ? (
                <ScrollView>
                  <View style={styles.cityDetailHeader}>
                    <Text style={styles.cityDetailName}>{selectedCity.name}</Text>
                    <Text style={styles.cityDetailTime}>{selectedCity.time}</Text>
                  </View>

                  <View style={styles.cityDetailTempContainer}>
                    <WeatherIcon condition={selectedCity.condition} size={80} />
                    <Text style={styles.cityDetailTemp}>{selectedCity.temp}</Text>
                  </View>

                  {selectedCity.details && (
                    <>
                      <Text style={styles.weatherDescription}>
                        {selectedCity.details.description.charAt(0).toUpperCase() + selectedCity.details.description.slice(1)}
                      </Text>
                      
                      <View style={styles.tempRangeContainer}>
                        <Text style={styles.tempRange}>
                          L: {selectedCity.details.minTemp} | H: {selectedCity.details.maxTemp}
                        </Text>
                      </View>

                      <View style={styles.detailsGrid}>
                        {renderDetailCard('water-outline', 'Humidity', `${selectedCity.details.humidity}%`)}
                        {renderDetailCard('thermometer-outline', 'Feels Like', selectedCity.details.feelsLike)}
                        {renderDetailCard('speedometer-outline', 'Pressure', `${selectedCity.details.pressure} hPa`)}
                        {renderDetailCard('partly-sunny', 'Wind', selectedCity.details.windSpeed)}
                        {renderDetailCard('sunny-outline', 'Sunrise', selectedCity.details.sunrise)}
                        {renderDetailCard('moon-outline', 'Sunset', selectedCity.details.sunset)}
                      </View>
                    </>
                  )}
                </ScrollView>
              ) : null}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2737',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchBar: {
    backgroundColor: '#2B3543',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchPlaceholder: {
    color: '#6F7E8F',
    fontSize: 16,
  },
  citiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cityCard: {
    backgroundColor: '#2B3543',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityInfo: {
    flex: 1,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  cityTime: {
    fontSize: 14,
    color: '#6F7E8F',
    marginTop: 4,
  },
  tempContainer: {
    minWidth: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  removeButton: {
    backgroundColor: '#FF5252',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2B3543',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: 'white',
    marginRight: 10,
  },
  cancelButton: {
    color: 'white',
    fontSize: 16,
  },
  searchResultsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchResultItem: {
    backgroundColor: '#2B3543',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchResultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  searchResultTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E2737',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  closeModalButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  cityDetailHeader: {
    marginTop: 20,
    marginBottom: 20,
  },
  cityDetailName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  cityDetailTime: {
    fontSize: 16,
    color: '#6F7E8F',
    marginTop: 4,
  },
  cityDetailTempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  cityDetailTemp: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
  },
  weatherDescription: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  tempRangeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  tempRange: {
    fontSize: 16,
    color: 'white',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailCard: {
    backgroundColor: '#2B3543',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 14,
    color: '#6F7E8F',
    marginTop: 10,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  activeIcon: {
    marginLeft: 8,
  },
});