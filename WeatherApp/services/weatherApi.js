const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

function cleanCityName(city) {
  return city
    .replace(/\b(city|town|municipality|barangay|brgy)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Builds a "Barangay, City, Province, Country" style string
// from whatever admin levels Open-Meteo returns
function buildLocationLabel(result) {
  const { name, admin1, admin2, admin3, admin4, country } = result;

  const rawParts = [name, admin4, admin3, admin2, admin1, country].filter(Boolean);

  // Normalize for comparison: lowercase, strip "city of" / "municipality of" / "province of" prefixes
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/^(city of|municipality of|province of)\s+/i, "")
      .trim();

  const seen = new Set();
  const parts = [];

  for (const part of rawParts) {
    const key = normalize(part);
    if (!seen.has(key)) {
      seen.add(key);
      parts.push(part);
    }
  }

  return parts.join(", ");
}

export async function getWeatherByCity(city) {
  const cleaned = cleanCityName(city);
  const searchTerm = cleaned || city;

  const geoRes = await fetch(
    `${GEO_URL}?name=${encodeURIComponent(searchTerm)}&count=1&language=en`
  );
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    if (searchTerm !== city) {
      const retryRes = await fetch(
        `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en`
      );
      const retryData = await retryRes.json();
      if (retryData.results && retryData.results.length > 0) {
        return fetchWeatherForResult(retryData.results[0]);
      }
    }
    throw new Error("City not found");
  }

  return fetchWeatherForResult(geoData.results[0]);
}

async function fetchWeatherForResult(result) {
  const { latitude, longitude } = result;
  const locationLabel = buildLocationLabel(result);

  const weatherRes = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`
  );

  if (!weatherRes.ok) {
    throw new Error("Failed to fetch weather");
  }

  const weatherData = await weatherRes.json();

  return {
    locationLabel,
    ...weatherData.current,
  };
}

// Maps Open-Meteo's weather_code to an icon name for MaterialCommunityIcons
export function getWeatherIconName(code) {
  if (code === 0) return "weather-sunny";
  if (code === 1 || code === 2) return "weather-partly-cloudy";
  if (code === 3) return "weather-cloudy";
  if (code === 45 || code === 48) return "weather-fog";
  if (code >= 51 && code <= 55) return "weather-partly-rainy";
  if (code >= 61 && code <= 65) return "weather-rainy";
  if (code >= 71 && code <= 75) return "weather-snowy";
  if (code === 80) return "weather-pouring";
  if (code === 95) return "weather-lightning";
  return "weather-cloudy";
}

export function getWeatherDescription(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    95: "Thunderstorm",
  };
  return map[code] || "Unknown";
}