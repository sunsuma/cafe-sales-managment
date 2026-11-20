import { useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { C } from "../src/constants/colors";
import ArbosSplashScreen from "../src/components/ArbosSplashScreen";

export default function Layout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isSplashVisible ? "#F40808" : C.bg,
      }}
    >
      <StatusBar
        style={isSplashVisible ? "light" : "dark"}
        backgroundColor={isSplashVisible ? "#F40808" : C.bg}
      />
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
        <Stack.Screen
          name="settings/index"
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "slide_from_left",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>
      {isSplashVisible && (
        <ArbosSplashScreen onFinish={() => setIsSplashVisible(false)} />
      )}
    </View>
  );
}
