import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { API_BASE_URL, fetchModels } from "../src/api";

const heroMetrics = [
  { label: "Models ready", value: "3-5" },
  { label: "Deployment", value: "Vercel + Render" },
  { label: "Frontend", value: "React Native Web" },
];

export default function HomeScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchModels()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setModels(data.models || []);
      })
      .catch((fetchError) => {
        if (!isMounted) {
          return;
        }

        setError(fetchError.message);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleModels = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return models;
    }

    return models.filter((model) => {
      return [model.name, model.description, model.id].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    });
  }, [models, searchTerm]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>E-Commerce Analytics Platform</Text>
          <Text style={styles.title}>
            Choose a model and deploy it with a mobile-first web experience.
          </Text>
          <Text style={styles.subtitle}>
            This React Native frontend is designed for Vercel, while the FastAPI
            model service runs on Render.
          </Text>

          <View style={styles.metricsRow}>
            {heroMetrics.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available models</Text>
          <Text style={styles.sectionCaption}>
            Uploaded models appear here automatically from the API.
          </Text>
          <Text style={styles.sectionCaption}>API base: {API_BASE_URL}</Text>
        </View>

        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search models"
          placeholderTextColor="#7c8799"
          style={styles.searchInput}
        />

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#2f6fed" />
            <Text style={styles.stateText}>Loading models...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Unable to load models</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Text style={styles.stateHint}>
              The frontend is reading the API URL from EXPO_PUBLIC_API_BASE_URL.
              Check the deployed value and make sure it points to the Render
              service root, not a path like /models.
            </Text>
          </View>
        ) : visibleModels.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>No models found</Text>
            <Text style={styles.stateText}>
              Add 3 to 5 model files on the backend and they will show up here.
            </Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {visibleModels.map((model) => (
              <View key={model.id} style={styles.modelCard}>
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>{model.name}</Text>
                  <View
                    style={[
                      styles.badge,
                      model.available ? styles.badgeReady : styles.badgeMissing,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {model.available ? "Ready" : "Missing"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modelDescription}>{model.description}</Text>

                <View style={styles.tagRow}>
                  {model.input_fields?.map((field) => (
                    <View key={field} style={styles.tag}>
                      <Text style={styles.tagText}>{field}</Text>
                    </View>
                  ))}
                </View>

                <Link href={`/model/${model.id}`} asChild>
                  <Pressable style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Open model</Text>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  container: {
    padding: 20,
    gap: 18,
    backgroundColor: "#0b1020",
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: "#101a34",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 14,
  },
  kicker: {
    color: "#7fb0ff",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#f4f7ff",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  subtitle: {
    color: "#b9c4da",
    fontSize: 15,
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
  },
  metricCard: {
    minWidth: 110,
    flexGrow: 1,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  metricLabel: {
    color: "#9eaacc",
    marginTop: 4,
    fontSize: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: "#f4f7ff",
    fontSize: 22,
    fontWeight: "800",
  },
  sectionCaption: {
    color: "#93a0bc",
    fontSize: 13,
  },
  searchInput: {
    borderRadius: 18,
    backgroundColor: "#101a34",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#f4f7ff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  stateBox: {
    borderRadius: 24,
    backgroundColor: "#101a34",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 20,
    gap: 8,
    alignItems: "flex-start",
  },
  stateTitle: {
    color: "#f4f7ff",
    fontSize: 18,
    fontWeight: "700",
  },
  stateText: {
    color: "#b9c4da",
    fontSize: 14,
    lineHeight: 20,
  },
  stateHint: {
    color: "#7fb0ff",
    fontSize: 13,
  },
  cardGrid: {
    gap: 14,
  },
  modelCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#121d3b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  modelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  modelName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  modelDescription: {
    color: "#b9c4da",
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeReady: {
    backgroundColor: "rgba(54, 209, 148, 0.18)",
  },
  badgeMissing: {
    backgroundColor: "rgba(255, 128, 128, 0.18)",
  },
  badgeText: {
    color: "#f4f7ff",
    fontSize: 11,
    fontWeight: "700",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: "rgba(127, 176, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: "#9dc2ff",
    fontSize: 11,
    fontWeight: "600",
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#2f6fed",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
