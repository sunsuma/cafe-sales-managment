import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Btn, Card, Field, Heading } from "../../src/components/ui";
import { C } from "../../src/constants/colors";
import { createBackup } from "../../src/services/backupService";
import { useCafeStore } from "../../src/store/useCafeStore";

type DrawerPage = "menu" | "profile" | "backup" | "about" | "help";

export default function Settings() {
  const { settings, setSettings, restore } = useCafeStore();
  const [name, setName] = useState(settings.cafeName);
  const [activePage, setActivePage] = useState<DrawerPage>("menu");
  const { width } = useWindowDimensions();

  const menuItems = [
    {
      label: "Home",
      icon: "home-outline",
      onPress: () => router.back(),
    },
    {
      label: "Manage Menu",
      icon: "clipboard-outline",
      onPress: () => router.replace("/(tabs)/items"),
    },
    {
      label: "Café Profile & Settings",
      icon: "settings-outline",
      onPress: () => setActivePage("profile"),
    },
    {
      label: "Backup & Restore",
      icon: "save-outline",
      onPress: () => setActivePage("backup"),
    },
    {
      label: "About App",
      icon: "information-circle-outline",
      onPress: () => setActivePage("about"),
    },
    {
      label: "Help & Instructions",
      icon: "help-circle-outline",
      onPress: () => setActivePage("help"),
    },
  ] as const;

  async function backup() {
    try {
      await createBackup();
    } catch (e) {
      Alert.alert("Backup failed", String(e));
    }
  }

  async function restoreBackup() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    try {
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const data = JSON.parse(raw);
      if (
        data.version !== 1 ||
        !Array.isArray(data.items) ||
        !Array.isArray(data.orders) ||
        !data.settings
      ) {
        throw new Error("Unsupported or invalid backup file.");
      }

      Alert.alert(
        "Restore backup?",
        "This replaces the current menu and order data on this device.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Restore",
            style: "destructive",
            onPress: () => {
              restore({
                items: data.items,
                orders: data.orders,
                settings: data.settings,
              });
              Alert.alert("Restore complete");
            },
          },
        ],
      );
    } catch (e) {
      Alert.alert("Could not restore backup", String(e));
    }
  }

  const backToMenu = (
    <TouchableOpacity
      onPress={() => setActivePage("menu")}
      accessibilityRole="button"
      accessibilityLabel="Back to drawer menu"
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <Ionicons name="arrow-back" size={20} color={C.dark} />
      <Text style={{ color: C.dark, fontSize: 14, fontWeight: "700", marginLeft: 8 }}>
        Menu
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: "rgba(0,0,0,0.38)",
      }}
    >
      <View
        style={{
          width: Math.min(width * 0.88, 400),
          height: "100%",
          backgroundColor: C.bg,
        }}
      >
        <SafeAreaView
          edges={["top"]}
          style={{ flex: 1, backgroundColor: C.bg }}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 18,
              backgroundColor: C.card,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Image
                source={require("../../assets/arbos-cafe-logo.png")}
                accessibilityLabel="ARBO's Cafe logo"
                resizeMode="contain"
                style={{ width: 64, height: 64 }}
              />
              <TouchableOpacity
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close-outline" size={24} color={C.muted} />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                marginTop: 10,
                color: C.dark,
                fontSize: 18,
                fontWeight: "800",
              }}
            >
              {settings.cafeName || "ARBO's Cafe"}
            </Text>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 18, paddingBottom: 28 }}
          >
            {activePage === "menu" &&
              menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderTopWidth: index === 4 ? 1 : 0,
                    borderTopColor: C.border,
                    marginTop: index === 4 ? 12 : 0,
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={21}
                    color={C.green}
                    style={{ width: 34 }}
                  />
                  <Text style={{ color: C.dark, fontSize: 15, fontWeight: "600" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

            {activePage === "profile" && (
              <>
                {backToMenu}
                <Heading
                  title="Café Profile & Settings"
                  sub="Manage your café brand name and profile."
                />
                <Card style={{ alignItems: "center" }}>
                  <Image
                    source={require("../../assets/arbos-cafe-logo.png")}
                    accessibilityLabel="Café logo"
                    resizeMode="contain"
                    style={{ width: 88, height: 88, marginBottom: 12 }}
                  />
                  <Text style={{ color: C.dark, fontSize: 17, fontWeight: "800" }}>
                    {settings.cafeName || "ARBO's Cafe"}
                  </Text>
                </Card>
                <Card>
                  <Field label="CAFÉ NAME" value={name} onChangeText={setName} />
                  <Btn
                    title="Save café name"
                    onPress={() => {
                      setSettings({ cafeName: name.trim() || "My Café" });
                      Alert.alert("Saved");
                    }}
                  />
                </Card>
              </>
            )}

            {activePage === "backup" && (
              <>
                {backToMenu}
                <Heading
                  title="Backup & Restore"
                  sub="Export your data or restore a saved backup."
                />
                <Card>
                  <Text style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>
                    Create a JSON backup of menu items, orders and settings. Save
                    the exported file somewhere safe to restore it later.
                  </Text>
                  <Btn title="Export local backup" onPress={backup} />
                  <Btn
                    title="Restore from backup"
                    onPress={restoreBackup}
                    secondary
                  />
                </Card>
              </>
            )}

            {activePage === "about" && (
              <>
                {backToMenu}
                <Heading title="About App" />
                <Card>
                  <Text style={{ color: C.dark, fontSize: 16, fontWeight: "700" }}>
                    ARBO's Cafe Sales Manager
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>
                    Manage café menu items, orders, and sales. Your data is stored
                    locally on this device.
                  </Text>
                </Card>
              </>
            )}

            {activePage === "help" && (
              <>
                {backToMenu}
                <Heading title="Help & Instructions" />
                <Card>
                  <Text style={{ color: C.dark, fontSize: 14, lineHeight: 21 }}>
                    Use Manage Menu to add or update café items. Open Café Profile
                    & Settings to change the café name. Use Backup & Restore to
                    export your data or restore a saved backup.
                  </Text>
                </Card>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>

      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close settings"
        style={{ flex: 1 }}
      />
    </View>
  );
}
