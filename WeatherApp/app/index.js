import { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import {
  getWeatherByCity,
  getWeatherByCoords,
  getAppGradient,
} from "../services/weatherApi";

export default function HomeScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCoords(item.latitude, item.longitude, item.label);
      setWeather(data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const gradientColors = getAppGradient(weather?.weather_code, weather?.is_day);

  return (
    <LinearGradient colors={gradientColors} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.appBar}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={20} color="#FFFFFF" />
          <Text style={styles.appBarText}>WeatherApp</Text>
        </View>

        <SearchBar onSearch={handleSearch} onSelectSuggestion={handleSelectSuggestion} />
        {loading && <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && <WeatherCard data={weather} />}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 40,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  appBarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  error: {
    textAlign: "center",
    color: "#FFB3B3",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 30,
  },
});