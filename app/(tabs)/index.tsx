import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../SettingsContext';
import { useWeather } from '../WeatherContext';

interface ForecastData {
  time: string;
  temp: number;
  condition: string;
  hour: number;
}

interface DailyForecastData {
  day: string;
  temp: number;
  condition: string;
  minTemp: number;
  maxTemp: number;
}

export default function HomeScreen() {
  const { weather, loading, error, fetchWeather, city } = useWeather();
  const { tempUnit, windSpeedUnit, pressureUnit, distanceUnit } = useSettings();
  const [showAirDetails, setShowAirDetails] = useState(false);
  const [input, setInput] = useState('');
  const [hourlyForecast, setHourlyForecast] = useState<ForecastData[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastData[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);

  // Fetch hourly forecast
  const fetchHourlyForecast = async (cityName: string) => {
    setForecastLoading(true);
    try {
      const units = tempUnit === 'Fahrenheit' ? 'imperial' : 'metric';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=357d7d866cdd4097d43a4e92e52e2220&units=${units}`
      );
      if (!response.ok) throw new Error('Failed to fetch forecast');
      const data = await response.json();
      
      // Get exactly 8 data points for 24 hours (3-hour intervals)
      const todayForecasts = data.list.slice(0, 8).map((item: any) => {
        const date = new Date(item.dt * 1000);
        const currentHour = new Date().getHours();
        const forecastHour = date.getHours();
        
        // Format time to show AM/PM
        const timeString = date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });

        return {
          time: timeString,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main.toLowerCase(),
          hour: forecastHour
        };
      });
      
      setHourlyForecast(todayForecasts);
    } catch (err) {
      console.error('Error fetching hourly forecast:', err);
    } finally {
      setForecastLoading(false);
    }
  };

  // Fetch daily forecast
  const fetchDailyForecast = async (cityName: string) => {
    setDailyLoading(true);
    try {
      const units = tempUnit === 'Fahrenheit' ? 'imperial' : 'metric';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=357d7d866cdd4097d43a4e92e52e2220&units=${units}`
      );
      if (!response.ok) throw new Error('Failed to fetch forecast');
      const data = await response.json();
      
      // Get current date
      const today = new Date();
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Create array for 7 days starting from today
      const sevenDaysForecast = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayName = weekDays[date.getDay()];
        
        // Find the forecast data for this day
        const dayForecast = data.list.find((item: any) => {
          const forecastDate = new Date(item.dt * 1000);
          return forecastDate.toDateString() === date.toDateString();
        });

        if (dayForecast) {
          return {
            day: i === 0 ? 'Today' : dayName,
            temp: Math.round(dayForecast.main.temp),
            condition: dayForecast.weather[0].main.toLowerCase(),
            minTemp: Math.round(dayForecast.main.temp_min),
            maxTemp: Math.round(dayForecast.main.temp_max)
          };
        } else {
          // If no forecast data for this day, use the last available data
          const lastForecast = data.list[data.list.length - 1];
          return {
            day: i === 0 ? 'Today' : dayName,
            temp: Math.round(lastForecast.main.temp),
            condition: lastForecast.weather[0].main.toLowerCase(),
            minTemp: Math.round(lastForecast.main.temp_min),
            maxTemp: Math.round(lastForecast.main.temp_max)
          };
        }
      });

      setDailyForecast(sevenDaysForecast);
    } catch (err) {
      console.error('Error fetching daily forecast:', err);
    } finally {
      setDailyLoading(false);
    }
  };

  // Fetch weather for a new city
  const fetchCityWeather = () => {
    if (!input) return;
    fetchWeather(input);
    fetchHourlyForecast(input);
    fetchDailyForecast(input);
    setInput('');
  };

  // Fetch forecasts when weather data is available
  useEffect(() => {
    if (weather?.name) {
      fetchHourlyForecast(weather.name);
      fetchDailyForecast(weather.name);
    }
  }, [weather]);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('rain')) {
      return <Feather name="cloud-drizzle" size={32} color="#FFD700" />;
    } else if (condition.includes('cloud')) {
      return <Feather name="cloud" size={32} color="#FFD700" />;
    } else {
      return <Feather name="sun" size={32} color="#FFD700" />;
    }
  };

  // Calculate UV Index category
  const getUVIndexCategory = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  };

  // Format time to 12-hour format
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Update wind speed function to handle different units
  const getWindSpeed = (speed: number) => {
    if (!speed) return 0;
    
    // The API returns wind speed in m/s
    switch (windSpeedUnit) {
      case 'km/h':
        // Convert m/s to km/h (1 m/s = 3.6 km/h)
        return Math.round(speed * 3.6);
      case 'knots':
        // Convert m/s to knots (1 m/s = 1.944 knots)
        return Math.round(speed * 1.944);
      case 'm/s':
        // Already in m/s, just round
        return Math.round(speed);
      default:
        return Math.round(speed * 3.6); // Default to km/h
    }
  };

  // Add pressure conversion function
  const getPressure = (pressure: number) => {
    if (!pressure) return 0;
    
    // The API returns pressure in hPa
    switch (pressureUnit) {
      case 'hPa':
        return Math.round(pressure);
      case 'inches':
        // Convert hPa to inches of mercury (1 hPa = 0.02953 inches)
        return Math.round(pressure * 0.02953 * 100) / 100;
      case 'kPa':
        // Convert hPa to kPa (1 hPa = 0.1 kPa)
        return Math.round(pressure * 0.1 * 10) / 10;
      case 'mm':
        // Convert hPa to mm of mercury (1 hPa = 0.75006 mm)
        return Math.round(pressure * 0.75006);
      default:
        return Math.round(pressure); // Default to hPa
    }
  };

  // Add distance conversion function
  const getDistance = (distance: number) => {
    if (!distance) return 0;
    
    // The API returns distance in meters
    switch (distanceUnit) {
      case 'Kilometers':
        // Convert meters to kilometers
        return Math.round(distance / 1000 * 10) / 10;
      case 'Miles':
        // Convert meters to miles (1 meter = 0.000621371 miles)
        return Math.round(distance * 0.000621371 * 10) / 10;
      default:
        return Math.round(distance / 1000 * 10) / 10; // Default to km
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={{ marginTop: 40, marginBottom: 10 }}>
        <TextInput
          style={{
            backgroundColor: '#162237',
            borderRadius: 16,
            padding: 12,
            color: 'white',
            fontSize: 18,
            marginBottom: 8,
          }}
          placeholder="Search city..."
          placeholderTextColor="#A0A0A0"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={fetchCityWeather}
          returnKeyType="search"
        />
      </View>
      {/* Header */}
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator size="large" color="#4DA6FF" />
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : weather ? (
          <>
            <Text style={styles.city}>{weather.name}</Text>
            <Text style={styles.subtitle}>
              Chance of rain: {weather?.weather?.[0]?.main === 'Rain' ? '100%' : 
                weather?.weather?.[0]?.main === 'Drizzle' ? '70%' :
                weather?.weather?.[0]?.main === 'Thunderstorm' ? '90%' :
                weather?.weather?.[0]?.main === 'Snow' ? '80%' :
                weather?.weather?.[0]?.main === 'Mist' || weather?.weather?.[0]?.main === 'Fog' ? '40%' :
                weather?.weather?.[0]?.main === 'Clouds' ? '20%' : '0%'}
            </Text>
            <View style={styles.sunIcon}>
              {weather?.weather?.[0]?.main && (
                <MaterialIcons 
                  name={
                    weather.weather[0].main.toLowerCase().includes('rain') ? 'grain' :
                    weather.weather[0].main.toLowerCase().includes('thunderstorm') ? 'flash-on' :
                    weather.weather[0].main.toLowerCase().includes('snow') ? 'ac-unit' :
                    weather.weather[0].main.toLowerCase().includes('mist') || 
                    weather.weather[0].main.toLowerCase().includes('fog') ? 'cloud' :
                    weather.weather[0].main.toLowerCase().includes('cloud') ? 'cloud' :
                    'wb-sunny'
                  } 
                  size={100} 
                  color="#FFD700" 
                />
              )}
            </View>
            <Text style={styles.temperature}>{Math.round(weather.main.temp)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}</Text>
          </>
        ) : null}
      </View>

      {/* Today's Forecast */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>TODAY'S FORECAST</Text>
        {forecastLoading ? (
          <ActivityIndicator size="small" color="#4DA6FF" style={{ marginVertical: 20 }} />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyScrollContent}
          >
            {hourlyForecast.map((forecast, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={styles.hourText}>{forecast.time}</Text>
                <View style={styles.hourlyIconContainer}>
                  {getWeatherIcon(forecast.condition)}
                </View>
                <Text style={styles.hourTemp}>{forecast.temp}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 7-Day Forecast */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>7-DAY FORECAST</Text>
        {dailyLoading ? (
          <ActivityIndicator size="small" color="#4DA6FF" style={{ marginVertical: 20 }} />
        ) : (
          dailyForecast.map((item, idx) => (
            <View key={idx} style={styles.dailyRow}>
              <Text style={styles.day}>{item.day}</Text>
              <View style={styles.dailyIconContainer}>
                {getWeatherIcon(item.condition)}
              </View>
              <Text style={styles.temp}>{item.maxTemp}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}/{item.minTemp}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}</Text>
            </View>
          ))
        )}
      </View>

      {/* Air Conditions */}
      <View style={styles.card}>
        <View style={styles.airHeader}>
          <Text style={styles.cardTitle}>AIR CONDITIONS</Text>
          <TouchableOpacity 
            style={styles.seeMoreBtn}
            onPress={() => setShowAirDetails(true)}
          >
            <Text style={styles.seeMore}>See more</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.airDetails}>
          <View style={styles.airRow}>
            <View style={styles.airItem}>
              <MaterialIcons name="thermostat" size={20} color="#FFFFFF" />
              <View style={styles.airTextContainer}>
                <Text style={styles.airLabel}>Real Feel</Text>
                <Text style={styles.airValue}>{Math.round(weather?.main?.feels_like || 0)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}</Text>
              </View>
            </View>
            <View style={styles.airItem}>
              <Feather name="wind" size={20} color="#FFFFFF" />
              <View style={styles.airTextContainer}>
                <Text style={styles.airLabel}>Wind</Text>
                <Text style={styles.airValue}>{getWindSpeed(weather?.wind?.speed || 0)} {windSpeedUnit}</Text>
              </View>
            </View>
          </View>
          <View style={styles.airRow}>
            <View style={styles.airItem}>
              <FontAwesome5 name="tint" size={18} color="#FFFFFF" />
              <View style={styles.airTextContainer}>
                <Text style={styles.airLabel}>Humidity</Text>
                <Text style={styles.airValue}>{weather?.main?.humidity || 0}%</Text>
              </View>
            </View>
            <View style={styles.airItem}>
              <Feather name="sun" size={20} color="#FFFFFF" />
              <View style={styles.airTextContainer}>
                <Text style={styles.airLabel}>UV Index</Text>
                <Text style={styles.airValue}>{weather?.main?.pressure ? Math.round(weather.main.pressure / 100) : 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Expanded Air Conditions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAirDetails}
        onRequestClose={() => setShowAirDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Air Conditions</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAirDetails(false)}
              >
                <MaterialIcons name="close" size={24} color="#A0A0A0" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalCityContainer}>
                <Text style={styles.modalCityText}>{weather?.name || 'Loading...'}</Text>
                <Text style={styles.modalDateText}>
                  {new Date().toLocaleDateString([], { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              
              <View style={styles.modalWeatherInfo}>
                <View style={styles.modalWeatherIcon}>
                  {weather?.weather?.[0]?.main && (
                    <MaterialIcons 
                      name={
                        weather.weather[0].main.toLowerCase().includes('rain') ? 'grain' :
                        weather.weather[0].main.toLowerCase().includes('thunderstorm') ? 'flash-on' :
                        weather.weather[0].main.toLowerCase().includes('snow') ? 'ac-unit' :
                        weather.weather[0].main.toLowerCase().includes('mist') || 
                        weather.weather[0].main.toLowerCase().includes('fog') ? 'cloud' :
                        weather.weather[0].main.toLowerCase().includes('cloud') ? 'cloud' :
                        'wb-sunny'
                      } 
                      size={100} 
                      color="#FFD700" 
                    />
                  )}
                </View>
                <Text style={styles.modalWeatherDescription}>
                  {weather?.weather?.[0]?.description || 'Loading...'}
                </Text>
                <Text style={styles.modalTemp}>{Math.round(weather?.main?.temp || 0)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}</Text>
                <Text style={styles.modalFeelsLike}>
                  Feels like {Math.round(weather?.main?.feels_like || 0)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}
                </Text>
              </View>
              
              <View style={styles.modalGridContainer}>
                <View style={styles.modalGrid}>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <Feather name="sun" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>UV INDEX</Text>
                    <Text style={styles.modalGridValue}>
                      {weather?.main?.pressure ? Math.round(weather.main.pressure / 100) : 0}
                    </Text>
                    <Text style={styles.modalGridSubtext}>
                      {getUVIndexCategory(weather?.main?.pressure ? Math.round(weather.main.pressure / 100) : 0)}
                    </Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <Feather name="wind" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>WIND</Text>
                    <Text style={styles.modalGridValue}>{getWindSpeed(weather?.wind?.speed || 0)} {windSpeedUnit}</Text>
                    <Text style={styles.modalGridSubtext}>
                      {weather?.wind?.deg ? `${Math.round(weather.wind.deg)}°` : '--'}
                    </Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <FontAwesome5 name="tint" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>HUMIDITY</Text>
                    <Text style={styles.modalGridValue}>{weather?.main?.humidity || 0}%</Text>
                    <Text style={styles.modalGridSubtext}>Dew point {Math.round(weather?.main?.temp || 0)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}</Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <Feather name="eye" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>VISIBILITY</Text>
                    <Text style={styles.modalGridValue}>{getDistance(weather?.visibility || 0)} {distanceUnit === 'Kilometers' ? 'km' : 'mi'}</Text>
                    <Text style={styles.modalGridSubtext}>Clear</Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <MaterialIcons name="thermostat" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>FEELS LIKE</Text>
                    <Text style={styles.modalGridValue}>{Math.round(weather?.main?.feels_like || 0)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}</Text>
                    <Text style={styles.modalGridSubtext}>
                      {Math.round(weather?.main?.temp_max || 0)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'} / {Math.round(weather?.main?.temp_min || 0)}°{tempUnit === 'Fahrenheit' ? 'F' : 'C'}
                    </Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <Feather name="activity" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>PRESSURE</Text>
                    <Text style={styles.modalGridValue}>{getPressure(weather?.main?.pressure || 0)} {pressureUnit}</Text>
                    <Text style={styles.modalGridSubtext}>Normal</Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <Feather name="sunrise" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>SUNRISE</Text>
                    <Text style={styles.modalGridValue}>
                      {weather?.sys?.sunrise ? formatTime(weather.sys.sunrise) : '--:--'}
                    </Text>
                    <Text style={styles.modalGridSubtext}>Morning</Text>
                  </View>
                  <View style={styles.modalGridItem}>
                    <View style={styles.modalGridIconContainer}>
                      <Feather name="sunset" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.modalGridLabel}>SUNSET</Text>
                    <Text style={styles.modalGridValue}>
                      {weather?.sys?.sunset ? formatTime(weather.sys.sunset) : '--:--'}
                    </Text>
                    <Text style={styles.modalGridSubtext}>Evening</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1127',
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
    marginTop: 10,
  },
  city: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 4,
  },
  sunIcon: {
    marginVertical: 20,
    alignItems: 'center',
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: '#162237',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#A0A0A0',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 16,
  },
  hourlyScrollContent: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 24,
    minWidth: 80,
  },
  hourText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  hourlyIconContainer: {
    marginVertical: 8,
  },
  hourTemp: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  dailyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    alignItems: 'center',
  },
  day: {
    color: 'white',
    flex: 1,
    fontSize: 14,
  },
  dailyIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  temp: {
    color: 'white',
    flex: 0.5,
    textAlign: 'right',
    fontSize: 14,
  },
  airHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeMoreBtn: {
    backgroundColor: '#4DA6FF30',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  seeMore: {
    color: '#4DA6FF',
    fontSize: 15,
  },
  airDetails: {
    marginTop: 16,
  },
  airRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  airItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  airTextContainer: {
    marginLeft: 12,
  },
  airLabel: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  airValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#162237',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A5A',
  },
  modalTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCityContainer: {
    marginBottom: 16,
  },
  modalCityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalDateText: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 4,
  },
  modalWeatherInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTemp: {
    color: 'white',
    fontSize: 48,
    fontWeight: '300',
    marginVertical: 8,
  },
  modalWeatherDescription: {
    color: '#A0A0A0',
    fontSize: 18,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginVertical: 8,
  },
  modalFeelsLike: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 4,
  },
  modalGridContainer: {
    width: '100%',
    // backgroundColor: '#1A2A4A',
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalGridItem: {
    width: '48%',
    backgroundColor: '#162237',
    paddingVertical: 16,
    paddingHorizontal: 12,
    // borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#2A3A5A',
  },
  modalGridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A3A5A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4DA6FF30',
  },
  modalGridLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalGridValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalGridSubtext: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  modalWeatherIcon: {
    alignItems: 'center',
    marginVertical: 10,
  },
});