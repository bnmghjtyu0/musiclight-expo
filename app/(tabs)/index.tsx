import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

const json: Json = require("@/assets/dictionary.json");
export interface Json {
  greWord: GreWord;
}

export interface GreWord {
  meaning: string;
  word: string;
}

export default function HomeScreen() {
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    enableSound();
  }, []);

  const enableSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/soundFile.mp3")
    );
    if (Platform.OS === "ios") {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      await sound.playAsync();
    }
    let voices = await Speech.getAvailableVoicesAsync();
    // console.log(voices);
  };

  const speak = () => {
    console.log("speak");
    const greeting = `123`;
    const options = {
      voice: "com.apple.voice.compact.zh-TW.Meijia",
      pitch: 1.5,
    };
    Speech.speak(greeting, options);
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <Button title="Press to hear some words" onPress={speak} />
        {/* <View>
          <Text onPress={handlePress}>{json.greWord.word}</Text>
          <Text>{json.greWord.meaning}</Text>
        </View> */}
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
