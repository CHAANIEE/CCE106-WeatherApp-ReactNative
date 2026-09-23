import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
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
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#1B2E45" />
        </TouchableOpacity>
      </View>
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
});