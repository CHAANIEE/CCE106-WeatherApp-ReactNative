import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: "Weather",
        headerStyle: { backgroundColor: "#3478f6" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    />
  );
}