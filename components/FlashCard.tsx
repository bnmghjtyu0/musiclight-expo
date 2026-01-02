import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react-native";
import * as Speech from "expo-speech";
const { width } = Dimensions.get("window");

interface Card {
  lesson: string;
  term: string;
  zh_term: string;
  pos: string;
  en_example: string;
  zh_example: string;
}

const FlashcardApp = () => {
  // --- 狀態管理 ---
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [flashcards, setFlashcards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("all");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // --- 動化控制 ---
  const flipAnimation = useRef(new Animated.Value(0)).current;

  // 翻牌動畫邏輯
  const handleFlip = () => {
    if (isFlipped) {
      Animated.spring(flipAnimation, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnimation, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  // --- 資料抓取 ---
  const googleSheetUrl =
    "https://docs.google.com/spreadsheets/d/1o9mbuNDNKOgE96Io8kesJzcuAGiRpP3cZLVENXwALy0/export?format=csv&gid=0";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(googleSheetUrl);
      const csvText = await response.text();
      parseCSV(csvText);
    } catch (err) {
      setError("無法載入資料，請檢查網路或權限");
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const cards = [];
    const lessonSet = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim());
      // 假設順序: lesson, term, zh_term, pos, en_example, zh_example
      const card = {
        lesson: values[0] || "Default",
        term: values[1],
        zh_term: values[2],
        pos: values[3],
        en_example: values[4],
        zh_example: values[5],
      };
      if (card.term) {
        cards.push(card);
        lessonSet.add(card.lesson);
      }
    }

    setAllCards(cards);
    setFlashcards(cards);
    setLessons(Array.from(lessonSet));
  };

  // --- 導覽邏輯 ---
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      if (isFlipped) handleFlip();
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      if (isFlipped) handleFlip();
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  };

  const playSound = (word: string) => {
    // 簡單的縮放動畫，模擬發聲感
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 這裡放入你的播放邏輯 (例如 expo-av)
    Speech.speak(word, {
      language: "zh-TW",
      pitch: 1.2,
      rate: 0.9,
    });
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );

  const currentCard = flashcards[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Sparkles color="#fff" size={20} />
        </View>
        <Text style={styles.headerTitle}>AI Flashcards</Text>
      </View>

      <ScrollView contentContainerStyle={styles.main}>
        <View style={styles.infoRow}>
          <Text style={styles.counterText}>
            Card {currentIndex + 1} of {flashcards.length}
          </Text>
          <TouchableOpacity
            onPress={() => {
              /* 重置邏輯 */
            }}
          >
            <RefreshCw size={18} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Flashcard Container */}
        <View style={styles.cardWrapper}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleFlip}
            style={styles.cardTouchable}
          >
            {/* Front Card */}
            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                {
                  zIndex: isFlipped ? -1 : 1,
                  transform: [{ rotateY: frontInterpolate }],
                },
              ]}
            >
              <View style={[styles.badge, styles.frontBadge]}>
                <Text style={styles.frontBadgeText}>Question</Text>
              </View>
              <Text style={styles.termText}>{currentCard?.term}</Text>

              <TouchableOpacity
                onPress={(e) => {
                  playSound(currentCard?.term);
                }}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Volume2 color="#6366f1" size={28} />
                </Animated.View>
              </TouchableOpacity>
              <Text style={styles.hintText}>Tap to reveal answer</Text>
            </Animated.View>
            {/* Child components can still receive touches */}
            {/* Back Card */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                {
                  position: "absolute",
                  top: 0,
                  zIndex: isFlipped ? 1 : -1,
                  transform: [{ rotateY: backInterpolate }],
                },
              ]}
            >
              <View style={[styles.badge, styles.backBadge]}>
                <Text style={styles.backBadgeText}>Answer</Text>
              </View>
              <Text style={styles.backTermText}>
                {currentCard?.term} ({currentCard?.pos})
              </Text>
              <Text style={styles.zhTermText}>{currentCard?.zh_term}</Text>
              <View style={styles.exampleContainer}>
                <TouchableOpacity
                  onPress={(e) => {
                    playSound(currentCard?.en_example);
                  }}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: scaleAnim }],
                    }}
                  >
                    <Volume2 color="#fff" size={28} />
                    <Text style={styles.exampleEn}>
                      {currentCard?.en_example}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>

                <Text style={styles.exampleZh}>{currentCard?.zh_example}</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.disabledBtn]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft color={currentIndex === 0 ? "#ccc" : "#374151"} />
            <Text style={styles.navBtnText}>Prev</Text>
          </TouchableOpacity>

          <View style={styles.dotsRow}>
            <View style={styles.dotActive} />
          </View>

          <TouchableOpacity
            style={[
              styles.navBtn,
              currentIndex === flashcards.length - 1 && styles.disabledBtn,
            ]}
            onPress={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            <Text style={styles.navBtnText}>Next</Text>
            <ChevronRight
              color={
                currentIndex === flashcards.length - 1 ? "#ccc" : "#374151"
              }
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logoContainer: {
    backgroundColor: "#6366f1",
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  main: { padding: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  counterText: { color: "#6b7280", fontWeight: "500" },
  cardWrapper: { height: 400, width: "100%", marginBottom: 30 },
  cardTouchable: { flex: 1 },
  card: {
    width: "100%",
    height: 400,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#c7d2fe",
  },
  cardBack: { backgroundColor: "#6366f1" },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  frontBadge: { backgroundColor: "#eef2ff" },
  frontBadgeText: { color: "#6366f1", fontWeight: "600" },
  backBadge: { backgroundColor: "rgba(255,255,255,0.2)" },
  backBadgeText: { color: "#fff", fontWeight: "600" },
  termText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  backTermText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  zhTermText: {
    fontSize: 20,
    color: "#eef2ff",
    marginTop: 8,
    marginBottom: 20,
  },
  hintText: { marginTop: 40, color: "#9ca3af", fontSize: 14 },
  exampleContainer: { marginTop: 10, alignItems: "center" },
  exampleEn: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  exampleZh: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  navBtnText: { fontWeight: "600", color: "#374151", marginHorizontal: 4 },
  disabledBtn: { opacity: 0.5 },
  dotsRow: { flexDirection: "row", gap: 8 },
  dotActive: {
    width: 30,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
  },
});

export default FlashcardApp;
