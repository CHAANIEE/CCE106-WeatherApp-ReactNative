import { useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import {
  getWeatherByCity,
  getWeatherByCoords,
  getAppGradient,
  APP_GRADIENT,
  reverseGeocode,
} from "../services/weatherApi";

export default function HomeScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchBarRef = useRef(null);

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

  const handleUseMyLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission denied");
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      const locationLabel = await reverseGeocode(latitude, longitude);

      const data = await getWeatherByCoords(latitude, longitude, locationLabel);
      setWeather(data);
    } catch (err) {
      setError(err.message || "Unable to get your location");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWeather(null);
    setError(null);
    setLoading(false);
    searchBarRef.current?.reset();
  };

  const gradientColors = weather
    ? getAppGradient(weather.weather_code, weather.is_day)
    : APP_GRADIENT;

  const showEmptyState = !loading && !error && !weather;

  return (
    <LinearGradient colors={gradientColors} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.appBar} onPress={handleReset} activeOpacity={0.7}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={20} color="#FFFFFF" />
          <Text style={styles.appBarText}>WeatherApp</Text>
        </TouchableOpacity>

        <SearchBar
          ref={searchBarRef}
          onSearch={handleSearch}
          onSelectSuggestion={handleSelectSuggestion}
        />

        {loading && <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 40 }} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && weather && <WeatherCard data={weather} />}

        {showEmptyState && (
          <View style={styles.emptyState}>
            <View style={styles.iconStack}>
              <MaterialCommunityIcons
                name="cloud"
                size={70}
                color="rgba(255,255,255,0.35)"
                style={styles.cloudBack}
              />
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={44}
                color="#FFD54F"
                style={styles.sunIcon}
              />
              <MaterialCommunityIcons
                name="cloud"
                size={90}
                color="#FFFFFF"
                style={styles.cloudFront}
              />
            </View>

            <Text style={styles.emptyTitle}>Where are you headed?</Text>
            <Text style={styles.emptySubtitle}>
              Find the current weather and forecast{"\n"}for any location.
            </Text>

            <TouchableOpacity style={styles.locationButton} onPress={handleUseMyLocation}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#FFFFFF" />
              <Text style={styles.locationButtonText}>Use My Location</Text>
            </TouchableOpacity>
          </View>
        )}
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
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 60,
  },
  iconStack: {
    width: 140,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  cloudBack: {
    position: "absolute",
    left: 0,
    top: 10,
  },
  sunIcon: {
    position: "absolute",
    top: 0,
    right: 20,
  },
  cloudFront: {
    position: "absolute",
    bottom: 0,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});