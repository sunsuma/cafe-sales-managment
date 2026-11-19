import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function ArbosSplashScreen({ onFinish }: SplashScreenProps) {
  const arboScale = useRef(new Animated.Value(0.3)).current;
  const arboOpacity = useRef(new Animated.Value(0)).current;
  const cafeTranslateY = useRef(new Animated.Value(30)).current;
  const cafeOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const entrance = Animated.sequence([
      Animated.parallel([
        Animated.spring(arboScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(arboOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(cafeTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(cafeOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entrance.start(({ finished }) => {
      if (finished) pulse.start();
    });

    const timer = setTimeout(() => onFinish?.(), 2800);

    return () => {
      clearTimeout(timer);
      entrance.stop();
      pulse.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrapper,
          { transform: [{ scale: pulseAnim }, { rotate: "-5deg" }] },
        ]}
      >
        <Animated.View
          style={[
            styles.arboRow,
            {
              opacity: arboOpacity,
              transform: [{ scale: arboScale }],
            },
          ]}
        >
          <Text style={styles.arboText}>ARBO</Text>
          <View style={styles.apostropheS}>
            <Text style={styles.apostropheText}>'</Text>
            <Text style={styles.sText}>s</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.cafeContainer,
            {
              opacity: cafeOpacity,
              transform: [{ translateY: cafeTranslateY }],
            },
          ]}
        >
          <Text style={styles.cafeText}>CAFe</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    elevation: 10,
    backgroundColor: "#F40808",
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  arboRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  arboText: {
    fontSize: 82,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
    textShadowColor: "#111111",
    textShadowOffset: { width: -5, height: 7 },
    textShadowRadius: 1,
  },
  apostropheS: {
    marginLeft: 2,
    alignItems: "center",
  },
  apostropheText: {
    fontSize: 54,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 50,
    textShadowColor: "#111111",
    textShadowOffset: { width: -4, height: 5 },
    textShadowRadius: 1,
  },
  sText: {
    fontSize: 44,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: -12,
    textShadowColor: "#111111",
    textShadowOffset: { width: -4, height: 5 },
    textShadowRadius: 1,
  },
  cafeContainer: {
    marginTop: -14,
    marginRight: 28,
  },
  cafeText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFC700",
    letterSpacing: 1,
    textShadowColor: "#111111",
    textShadowOffset: { width: -4, height: 6 },
    textShadowRadius: 1,
  },
});
