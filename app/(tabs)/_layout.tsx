import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for tab bar icons

export default function TabsLayout() {
  return (
    <Tabs>
      {/* Home Page */}
      <Tabs.Screen
        name="HomePage"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} /> // Home icon
          ),
          headerShown: false, // Hides the default header
        }}
      />

      {/* Map View Page */}
      <Tabs.Screen
        name="MapViewPage"
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} /> // Map icon
          ),
          headerShown: false, // Hides the default header
        }}
      />

      {/* Add Item Page */}
      <Tabs.Screen
        name="AddItemPage"
        options={{
          tabBarLabel: "Add Item",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} /> // Add Item icon
          ),
          headerShown: false, // Hides the default header
        }}
      />

      {/* Bucket List Page */}
      <Tabs.Screen
        name="BucketListPage"
        options={{
          tabBarLabel: "Bucket List",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} /> // Bucket List icon
          ),
          headerShown: false, // Hides the default header
        }}
      />

      {/* Profile Page */}
      <Tabs.Screen
        name="ProfilePage"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} /> // Profile icon
          ),
          headerShown: false, // Hides the default header
        }}
      />
    </Tabs>
  );
}
