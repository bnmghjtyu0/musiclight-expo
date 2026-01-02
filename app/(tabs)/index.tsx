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

const json: Json = require("@/assets/dictionary.json");
export interface Json {
  greWord: GreWord;
}

export interface GreWord {
  meaning: string;
  word: string;
}

export default function HomeScreen() {

  const speak = async ( word: string) => {
    Speech.speak(word, {
      language: "zh-TW",
      pitch: 1.2,
      rate: 0.9,
    });
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
         
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      speak( json.greWord.word);
                    }}
                  >
                    <Text>{json.greWord.word}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      speak( json.greWord.meaning);
                    }}
                  >
                    <Text>{json.greWord.meaning}</Text>
                  </TouchableOpacity>
                </View>
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
