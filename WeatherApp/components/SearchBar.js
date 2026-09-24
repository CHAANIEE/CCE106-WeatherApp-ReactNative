import { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { searchLocations } from "../services/weatherApi";

export default function SearchBar({ onSearch, onSelectSuggestion }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSubmit = () => {
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim());
    }
  };

  const handleSelect = (item) => {
    setQuery(item.label);
    setShowSuggestions(false);
    setSuggestions([]);
    onSelectSuggestion(item);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="magnify" size={20} color="#CBD9E0" />
        <TextInput
          style={styles.input}
          placeholder="Search location..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {loadingSuggestions && <ActivityIndicator size="small" color="#CBD9E0" />}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#1B2E45" />
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={item.id ?? index}
              style={[
                styles.suggestionRow,
                index === suggestions.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => handleSelect(item)}
            >
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#CBD9E0" />
              <Text style={styles.suggestionText} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    marginBottom: 24,
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: "#16232F",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  suggestionText: {
    color: "#E8EEF4",
    fontSize: 13.5,
    flexShrink: 1,
  },
});