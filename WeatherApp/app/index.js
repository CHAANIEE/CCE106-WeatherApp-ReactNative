import { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import { getWeatherByCity, APP_GRADIENT } from "../services/weatherApi";

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

  return (
    <LinearGradient colors={APP_GRADIENT} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <SearchBar onSearch={handleSearch} />
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
    paddingTop: 30,
    paddingBottom: 40,
  },
  error: {
    textAlign: "center",
    color: "#FFB3B3",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 30,
  },
});