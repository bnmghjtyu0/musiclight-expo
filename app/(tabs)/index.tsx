import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as Speech from "expo-speech";
import { ScrollView } from "react-native";
import FlashcardApp from "@/components/FlashCard";

const json: Json = require("@/assets/dictionary.json");
export interface Json {
  greWord: GreWord;
}

export interface GreWord {
  meaning: string;
  word: string;
}

export default function HomeScreen() {

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
         <FlashcardApp/>
              
        </ScrollView>

       
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
