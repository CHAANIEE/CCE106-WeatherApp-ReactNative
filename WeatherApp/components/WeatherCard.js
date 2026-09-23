import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getWeatherDescription, getWeatherIconName } from "../services/weatherApi";

export default function WeatherCard({ data }) {
  if (!data) return null;

  const {
    locationLabel,
    temperature_2m,
    apparent_temperature,
    relative_humidity_2m,
    wind_speed_10m,
    weather_code,
  } = data;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <View style={styles.wrapper}>
      {/* Location header */}
      <View style={styles.locationRow}>
        <MaterialCommunityIcons name="map-marker" size={18} color="#3478f6" style={styles.locationIcon} />
        <Text style={styles.locationText} numberOfLines={2}>{locationLabel}</Text>
      </View>
      <Text style={styles.dateText}>{today}</Text>

      {/* Gradient temp card */}
      <LinearGradient
        colors={["#4facfe", "#3478f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.gradientTopRow}>
          <View>
            <Text style={styles.tempText}>{Math.round(temperature_2m)}°</Text>
            <Text style={styles.conditionText}>{getWeatherDescription(weather_code)}</Text>
          </View>
          <MaterialCommunityIcons
            name={getWeatherIconName(weather_code)}
            size={72}
            color="#fff"
          />
        </View>
      </LinearGradient>

      {/* Stat pills */}
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <MaterialCommunityIcons name="water-percent" size={22} color="#3478f6" />
          <Text style={styles.pillValue}>{relative_humidity_2m}%</Text>
          <Text style={styles.pillLabel}>Humidity</Text>
        </View>

        <View style={styles.pill}>
          <MaterialCommunityIcons name="weather-windy" size={22} color="#3478f6" />
          <Text style={styles.pillValue}>{wind_speed_10m} km/h</Text>
          <Text style={styles.pillLabel}>Wind</Text>
        </View>

        <View style={styles.pill}>
          <MaterialCommunityIcons name="thermometer" size={22} color="#3478f6" />
          <Text style={styles.pillValue}>{Math.round(apparent_temperature)}°</Text>
          <Text style={styles.pillLabel}>Feels like</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 8,
  },
  locationIcon: {
    marginTop: 2,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  dateText: {
    fontSize: 12,
    color: "#8a94a6",
    marginBottom: 16,
    marginLeft: 22,
  },
  gradientCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#3478f6",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  gradientTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tempText: {
    fontSize: 56,
    fontWeight: "700",
    color: "#fff",
  },
  conditionText: {
    fontSize: 16,
    color: "#eaf2ff",
    marginTop: 2,
  },
  pillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 10,
  },
  pill: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pillValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 6,
  },
  pillLabel: {
    fontSize: 11,
    color: "#8a94a6",
    marginTop: 2,
  },
});