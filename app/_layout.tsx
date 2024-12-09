// RootLayout.tsx
import React from "react";
import { Stack } from "expo-router";
import Navbar from "../components/navigation/NavBar";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Add other Stack.Screen components for multiple pages */}
      </Stack>
      <Navbar /> {/* Navbar will always be rendered at the bottom of every page */}
    </>
  );
}