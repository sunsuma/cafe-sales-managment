import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { C } from "../constants/colors";
export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={s.screen}>{children}</View>;
}
export function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={s.heading}>{title}</Text>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Txt({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return (
    <Text style={[{ color: C.text, fontSize: 14 }, style]}>{children}</Text>
  );
}
export function Btn({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.btn, secondary && { backgroundColor: C.greenLight }]}
    >
      <Text style={{ color: secondary ? C.green : C.white, fontWeight: "700" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 13 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={s.input}
        placeholderTextColor={C.faint}
      />
    </View>
  );
}
export function Pill({ text, paid }: { text: string; paid: boolean }) {
  return (
    <View
      style={{
        backgroundColor: paid ? C.paidBg : C.pendingBg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
      }}
    >
      <Text
        style={{
          color: paid ? C.paid : C.pending,
          fontSize: 11,
          fontWeight: "800",
        }}
      >
        {text}
      </Text>
    </View>
  );
}
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 18 },
  heading: { fontSize: 25, fontWeight: "800", color: C.dark },
  sub: { fontSize: 13, color: C.muted, marginTop: 4 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: C.border,
  },
  btn: {
    backgroundColor: C.green,
    borderRadius: 13,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },
  label: { fontSize: 12, fontWeight: "700", color: C.muted, marginBottom: 6 },
  input: {
    backgroundColor: C.input,
    borderRadius: 11,
    padding: 13,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
