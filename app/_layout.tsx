import { Tabs, Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index" // Ensure index.tsx is treated as a standalone screen
        options={{
          headerShown: false, // Hide the header for the index screen
        }}
      />
      <Stack.Screen
        name="(tabs)" // Load the Tabs navigator for the rest of the app
        options={{
          headerShown: false, // Hide headers for the tab screens
        }}
      />
    </Stack>
  );
}
