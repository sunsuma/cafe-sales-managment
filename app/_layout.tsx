import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { C } from "../src/constants/colors";
export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.dark,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="items/add"
          options={{ title: "Add menu item", presentation: "modal" }}
        />
        <Stack.Screen
          name="items/edit/[id]"
          options={{ title: "Edit menu item", presentation: "modal" }}
        />
        <Stack.Screen
          name="orders/create"
          options={{ title: "New order", presentation: "modal" }}
        />
        <Stack.Screen name="orders/[id]" options={{ title: "Order details" }} />
        <Stack.Screen
          name="orders/edit/[id]"
          options={{ title: "Edit order", presentation: "modal" }}
        />
        <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
      </Stack>
    </>
  );
}
