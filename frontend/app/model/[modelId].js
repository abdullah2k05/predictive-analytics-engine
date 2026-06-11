import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ModelScreen() {
  const { modelId } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{String(modelId)}</Text>
        <Text style={styles.subtitle}>
          Wire this screen to the matching input form for the selected model.
          The backend route is already ready for a per-model prediction request.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#b9c4da",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 560,
  },
});
