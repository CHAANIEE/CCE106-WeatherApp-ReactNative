import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getWeatherDescription, getWeatherIconName } from "../services/weatherApi";

function formatDayLabel(dateStr, index) {
  if (index === 0) return "Today";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function WeatherCard({ data }) {
  if (!data) return null;

  const {
    locationLabel,
    temperature_2m,
    apparent_temperature,
    relative_humidity_2m,
    wind_speed_10m,
    weather_code,
    daily,
  } = data;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <Text style={styles.dateText}>{today}</Text>
      <Text style={styles.locationText} numberOfLines={2}>{locationLabel}</Text>

      {/* Hero icon + temp */}
      <View style={styles.hero}>
        <MaterialCommunityIcons
          name={getWeatherIconName(weather_code)}
          size={130}
          color="#FFFFFF"
        />
        <Text style={styles.condition}>{getWeatherDescription(weather_code)}</Text>
        <Text style={styles.temp}>{Math.round(temperature_2m)}°</Text>
      </View>

      {/* Detail rows */}
      <View style={styles.detailsList}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Wind</Text>
          <Text style={styles.detailValue}>{wind_speed_10m} km/h</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{relative_humidity_2m}%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Feels like</Text>
          <Text style={styles.detailValue}>{Math.round(apparent_temperature)}°</Text>
        </View>
      </View>

      {/* 7-day forecast strip */}
      {daily && daily.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.forecastStrip}
          contentContainerStyle={styles.forecastStripContent}
        >
          {daily.map((day, index) => (
            <View key={day.date} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>{formatDayLabel(day.date, index)}</Text>
              <MaterialCommunityIcons
                name={getWeatherIconName(day.weatherCode)}
                size={28}
                color="#FFFFFF"
              />
              <Text style={styles.forecastTemp}>{Math.round(day.tempMax)}°</Text>
              <Text style={styles.forecastTempMin}>{Math.round(day.tempMin)}°</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  dateText: {
    fontSize: 14,
    color: "#CBD9E0",
    textAlign: "center",
    marginTop: 8,
  },
  locationText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 20,
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  condition: {
    fontSize: 16,
    color: "#CBD9E0",
    marginTop: 8,
  },
  temp: {
    fontSize: 64,
    fontWeight: "200",
    color: "#FFFFFF",
    marginTop: 4,
  },
  detailsList: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#AFC2CC",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  forecastStrip: {
    marginBottom: 20,
  },
  forecastStripContent: {
    gap: 18,
    paddingRight: 12,
  },
  forecastItem: {
    alignItems: "center",
    gap: 6,
  },
  forecastDay: {
    fontSize: 12,
    color: "#CBD9E0",
    fontWeight: "600",
  },
  forecastTemp: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  forecastTempMin: {
    fontSize: 11,
    color: "#8CA0AC",
  },
});