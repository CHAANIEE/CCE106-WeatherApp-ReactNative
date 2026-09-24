const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

function cleanCityName(city) {
  return city
    .replace(/\b(city|town|municipality|barangay|brgy)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLocationLabel(result) {
  const { name, admin1, admin2, admin3, admin4, country } = result;
  const rawParts = [name, admin4, admin3, admin2, admin1, country].filter(Boolean);

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

export async function searchLocations(query) {
  const cleaned = cleanCityName(query);
  const searchTerm = cleaned || query;

  if (!searchTerm || searchTerm.length < 2) return [];

  const res = await fetch(
    `${GEO_URL}?name=${encodeURIComponent(searchTerm)}&count=6&language=en`
  );
  const data = await res.json();

  if (!data.results) return [];

  return data.results.map((result) => ({
    id: result.id,
    label: buildLocationLabel(result),
    latitude: result.latitude,
    longitude: result.longitude,
    raw: result,
  }));
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
    throw new Error(
      "Location not found — try searching the nearest city instead"
    );
  }

  return fetchWeatherForResult(geoData.results[0]);
}

export async function getWeatherByCoords(latitude, longitude, locationLabel) {
  const weatherRes = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto`
  );

  if (!weatherRes.ok) {
    throw new Error("Failed to fetch weather");
  }

  const weatherData = await weatherRes.json();

  const daily = weatherData.daily.time.map((date, i) => ({
    date,
    weatherCode: weatherData.daily.weather_code[i],
    tempMax: weatherData.daily.temperature_2m_max[i],
    tempMin: weatherData.daily.temperature_2m_min[i],
  }));

  return {
    locationLabel,
    ...weatherData.current,
    daily,
  };
}

async function fetchWeatherForResult(result) {
  const locationLabel = buildLocationLabel(result);
  return getWeatherByCoords(result.latitude, result.longitude, locationLabel);
}

// isDay: 1 = daytime, 0 = nighttime (from Open-Meteo's current.is_day field)
export function getWeatherIconName(code, isDay = 1) {
  if (code === 0) return isDay ? "weather-sunny" : "weather-night";
  if (code === 1 || code === 2)
    return isDay ? "weather-partly-cloudy" : "weather-night-partly-cloudy";
  if (code === 3) return "weather-cloudy";
  if (code === 45 || code === 48) return "weather-fog";
  if (code >= 51 && code <= 55)
    return isDay ? "weather-partly-rainy" : "weather-night-partly-cloudy";
  if (code >= 61 && code <= 65) return "weather-rainy";
  if (code >= 71 && code <= 75) return "weather-snowy";
  if (code === 80) return "weather-pouring";
  if (code === 95) return "weather-lightning";

  return isDay ? "weather-cloudy" : "weather-night";
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

export const APP_GRADIENT = ["#3E7C82", "#1B2E45", "#101B2B"];

// Exact per-code color palette (daytime base colors, as specified)
const WEATHER_COLOR_MAP = {
  0: "#FFD21F",  // Clear sky - Yellow
  1: "#B8D83D",  // Mainly clear - Yellow-Green
  2: "#55C7E8",  // Partly cloudy - Cyan
  3: "#6B91A8",  // Overcast - Blue-Gray
  45: "#A8B6BA", // Fog - Gray
  48: "#8EDDE5", // Depositing rime fog - Ice Cyan
  51: "#55B8E8", // Light drizzle - Light Blue
  53: "#328FE0", // Moderate drizzle - Blue
  55: "#176DD1", // Dense drizzle - Deep Blue
  61: "#2186E3", // Slight rain - Blue
  63: "#5055D6", // Moderate rain - Blue-Purple
  65: "#7A35C7", // Heavy rain - Purple
  71: "#9BE8F0", // Slight snow - Cyan
  73: "#62CDE5", // Moderate snow - Light Blue
  75: "#3189D9", // Heavy snow - Blue
  80: "#6354D9", // Rain showers - Violet
  95: "#B52CCF", // Thunderstorm - Purple (transitions to red)
};

// Fixed deep navy gradient for clear nights (instead of blending yellow toward navy)
const CLEAR_NIGHT_GRADIENT = ["#0D1B3E", "#050B1F"];

// Darkens a hex color by a percentage (0-1)
function darkenHex(hex, amount = 0.35) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// Blends a hex color toward navy (for a nighttime tint on non-clear conditions)
function blendTowardNight(hex, amount = 0.55) {
  const nightR = 13, nightG = 20, nightB = 40;

  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const mixedR = Math.floor(r * (1 - amount) + nightR * amount);
  const mixedG = Math.floor(g * (1 - amount) + nightG * amount);
  const mixedB = Math.floor(b * (1 - amount) + nightB * amount);

  return `#${[mixedR, mixedG, mixedB].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function getAppGradient(code, isDay = 1) {
  if (code === undefined || code === null) return APP_GRADIENT;

  // Clear sky at night -> fixed deep navy, not a yellow blend
  if (code === 0 && !isDay) {
    return CLEAR_NIGHT_GRADIENT;
  }

  const baseColor = WEATHER_COLOR_MAP[code];
  if (!baseColor) return APP_GRADIENT;

  const startColor = isDay ? baseColor : blendTowardNight(baseColor);

  // Thunderstorm: purple fading into red, per the palette note
  if (code === 95) {
    return [startColor, isDay ? "#E53935" : blendTowardNight("#E53935")];
  }

  const endColor = darkenHex(startColor, 0.4);
  return [startColor, endColor];
}