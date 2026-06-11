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
import { useLocalSearchParams } from "expo-router";
import { fetchModelSchema, predictModel } from "../../src/api";

export default function ModelScreen() {
  const { modelId } = useLocalSearchParams();
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchModelSchema(String(modelId))
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setSchema(data);
        const initialValues = {};
        data.schema.fields.forEach((field) => {
          initialValues[field.name] = "";
        });
        setValues(initialValues);
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
  }, [modelId]);

  const fields = useMemo(() => schema?.schema?.fields || [], [schema]);

  const handleChange = (fieldName, value) => {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    setSubmitting(true);

    try {
      for (const field of fields) {
        if (field.required && String(values[field.name] ?? "").trim() === "") {
          throw new Error(`Please fill in ${field.label}`);
        }
      }

      const response = await predictModel(String(modelId), values);
      setResult(response);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Model details</Text>
          <Text style={styles.title}>{schema?.name || String(modelId)}</Text>
          <Text style={styles.subtitle}>
            {schema?.description || "Loading schema..."}
          </Text>
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#2f6fed" />
            <Text style={styles.stateText}>Loading model schema...</Text>
          </View>
        ) : error && !schema ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Unable to load model</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Input form</Text>
              <Text style={styles.sectionCaption}>
                Fill the model inputs and submit to get a prediction.
              </Text>
            </View>

            <View style={styles.formCard}>
              {fields.map((field) => (
                <View key={field.name} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    value={String(values[field.name] ?? "")}
                    onChangeText={(text) => handleChange(field.name, text)}
                    placeholder={field.placeholder}
                    placeholderTextColor="#7c8799"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              ))}

              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !submitting ? styles.primaryButtonPressed : null,
                  submitting ? styles.primaryButtonDisabled : null,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? "Predicting..." : "Run prediction"}
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateTitle}>Submission error</Text>
                <Text style={styles.stateText}>{error}</Text>
              </View>
            ) : null}

            {result ? (
              <View style={styles.resultCard}>
                <Text style={styles.sectionTitle}>Result</Text>
                <Text style={styles.resultValue}>
                  {String(result.prediction)}
                </Text>
                <Text style={styles.resultMeta}>
                  Model: {String(result.model_id)}
                </Text>
              </View>
            ) : null}
          </>
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
    padding: 24,
    gap: 18,
    backgroundColor: "#0b1020",
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: "#101a34",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 10,
  },
  kicker: {
    color: "#7fb0ff",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#b9c4da",
    fontSize: 15,
    lineHeight: 22,
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
  formCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#101a34",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: "#f4f7ff",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    borderRadius: 16,
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#f4f7ff",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#2f6fed",
    marginTop: 4,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
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
  resultCard: {
    borderRadius: 24,
    backgroundColor: "#121d3b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 20,
    gap: 8,
  },
  resultValue: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "800",
  },
  resultMeta: {
    color: "#93a0bc",
    fontSize: 13,
  },
});
