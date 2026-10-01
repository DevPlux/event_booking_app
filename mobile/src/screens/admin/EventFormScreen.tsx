// src/screens/admin/EventFormScreen.tsx

import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import InputField from "../../components/InputField";
import ErrorText from "../../components/ErrorText";

import { createEvent, updateEvent, getEventById } from "../../api/eventService";

import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "EventForm">;

const THEME = {
  navy: "#0F172A",
  violet: "#7C3AED",
  violetDark: "#5B21B6",

  lavender: "#EDE9FE",
  lavenderSoft: "#F5F3FF",

  white: "#FFFFFF",
  background: "#F8FAFC",

  text: "#111827",
  muted: "#64748B",
  border: "#E2E8F0",

  red: "#DC2626",
  redSoft: "#FEF2F2",

  green: "#059669",
  greenSoft: "#ECFDF5",
};

const CATEGORIES = [
  "Music",
  "Sports",
  "Conference",
  "Workshop",
  "Festival",
  "Exhibition",
  "Meetup",
  "Technology",
  "Education",
  "Entertainment",
  "Other",
];

const createDefaultEventDate = () => {
  const date = new Date();

  // Default new event to tomorrow.
  date.setDate(date.getDate() + 1);

  // Remove seconds/milliseconds.
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

export default function EventFormScreen({ route, navigation }: Props) {
  const editingId = route.params?.eventId;

  const isEditing = Boolean(editingId);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [eventDate, setEventDate] = useState<Date>(createDefaultEventDate());

  const [location, setLocation] = useState("");

  const [price, setPrice] = useState("");

  const [capacity, setCapacity] = useState("");

  const [category, setCategory] = useState("");

  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [serverError, setServerError] = useState("");

  const [saving, setSaving] = useState(false);

  const [loadingEvent, setLoadingEvent] = useState(isEditing);

  const [categoryOpen, setCategoryOpen] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  // ============================================================
  // Load existing event when editing
  // ============================================================

  useEffect(() => {
    if (!isEditing || !editingId) {
      return;
    }

    const loadEvent = async () => {
      try {
        setServerError("");

        const event = await getEventById(editingId);

        setName(event.name);

        setDescription(event.description);

        if (event.date) {
          const loadedDate = new Date(event.date);

          if (!Number.isNaN(loadedDate.getTime())) {
            setEventDate(loadedDate);
          }
        }

        setLocation(event.location);

        setPrice(String(event.price));

        setCapacity(String(event.capacity));

        setCategory(event.category);

        setImageUri(event.imageUrl);
      } catch (e) {
        setServerError(e instanceof Error ? e.message : "Failed to load event");
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [editingId, isEditing]);

  // ============================================================
  // Image
  // ============================================================

  const clearImageError = () => {
    setErrors((previous) => {
      const copy = {
        ...previous,
      };

      delete copy.image;

      return copy;
    });
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Allow photo access to select an event image.",
      );

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],

      allowsEditing: true,

      aspect: [16, 9],

      quality: 0.75,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);

      clearImageError();
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Allow camera access to take an event photo.",
      );

      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,

      aspect: [16, 9],

      quality: 0.75,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);

      clearImageError();
    }
  };

  const showImageOptions = () => {
    Alert.alert("Event Image", "Choose an image source", [
      {
        text: "Camera",
        onPress: pickFromCamera,
      },

      {
        text: "Photo Library",
        onPress: pickFromLibrary,
      },

      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // ============================================================
  // Date Picker
  // ============================================================

  const clearDateError = () => {
    setErrors((previous) => {
      const copy = {
        ...previous,
      };

      delete copy.date;

      return copy;
    });
  };

  const handleDateChange = (
    pickerEvent: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    // Android picker closes after selection.
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (pickerEvent.type === "dismissed" || !selectedDate) {
      return;
    }

    const updated = new Date(eventDate);

    // Change only the date.
    // Keep the selected event time.
    updated.setFullYear(selectedDate.getFullYear());

    updated.setMonth(selectedDate.getMonth());

    updated.setDate(selectedDate.getDate());

    setEventDate(updated);

    clearDateError();
  };

  // ============================================================
  // Time Picker
  // ============================================================

  const handleTimeChange = (
    pickerEvent: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (pickerEvent.type === "dismissed" || !selectedTime) {
      return;
    }

    const updated = new Date(eventDate);

    // Change only time.
    // Keep selected event date.
    updated.setHours(selectedTime.getHours());

    updated.setMinutes(selectedTime.getMinutes());

    updated.setSeconds(0);

    updated.setMilliseconds(0);

    setEventDate(updated);

    clearDateError();
  };

  // ============================================================
  // Formatting helpers
  // ============================================================

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = eventDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ============================================================
  // Validation
  // ============================================================

  const validate = () => {
    const validationErrors: Record<string, string> = {};

    if (!name.trim()) {
      validationErrors.name = "Event name is required";
    }

    if (!description.trim()) {
      validationErrors.description = "Description is required";
    }

    if (Number.isNaN(eventDate.getTime())) {
      validationErrors.date = "Please select a valid event date and time";
    } else if (eventDate.getTime() <= Date.now()) {
      validationErrors.date = "Event date and time must be in the future";
    }

    if (!location.trim()) {
      validationErrors.location = "Location is required";
    }

    if (!category.trim()) {
      validationErrors.category = "Category is required";
    }

    if (!price.trim()) {
      validationErrors.price = "Price is required";
    } else if (Number.isNaN(Number(price)) || Number(price) < 0) {
      validationErrors.price = "Enter a valid price";
    }

    if (!capacity.trim()) {
      validationErrors.capacity = "Capacity is required";
    } else if (
      Number.isNaN(Number(capacity)) ||
      !Number.isInteger(Number(capacity)) ||
      Number(capacity) < 1
    ) {
      validationErrors.capacity =
        "Capacity must be a whole number greater than 0";
    }

    if (!imageUri) {
      validationErrors.image = "Please choose an event image";
    }

    return validationErrors;
  };

  // ============================================================
  // Submit
  // ============================================================

  const onSubmit = async () => {
    setServerError("");

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setSaving(true);

    try {
      /*
        If imageUri is an existing Cloudinary URL,
        don't send it as another multipart image.

        Only newly-selected device images need uploading.
      */
      const localImageUri =
        imageUri &&
        !imageUri.startsWith("http://") &&
        !imageUri.startsWith("https://")
          ? imageUri
          : undefined;

      const payload = {
        name: name.trim(),

        description: description.trim(),

        // Backend receives a proper ISO date.
        date: eventDate.toISOString(),

        location: location.trim(),

        price: Number(price),

        capacity: Number(capacity),

        category: category.trim(),

        imageUri: localImageUri,
      };

      if (isEditing && editingId) {
        await updateEvent(editingId, payload);

        Alert.alert("Event Updated", "The event was updated successfully.", [
          {
            text: "OK",

            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Backend requires an image
        // when creating an event.
        if (!localImageUri) {
          setErrors((previous) => ({
            ...previous,

            image: "Please select an event image",
          }));

          setSaving(false);

          return;
        }

        await createEvent({
          ...payload,

          imageUri: localImageUri,
        });

        Alert.alert(
          "Event Created",
          "The new event was created successfully.",
          [
            {
              text: "OK",

              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Unable to save event");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Loading
  // ============================================================

  if (loadingEvent) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingBox}>
          <Ionicons name="hourglass-outline" size={32} color={THEME.violet} />

          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}

      <View style={styles.headerBar}>
        <View style={styles.headerGlow} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={THEME.navy} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.adminBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={11}
              color="#C4B5FD"
            />

            <Text style={styles.adminBadgeText}>EVENTORA ADMIN</Text>
          </View>

          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Event" : "Create Event"}
          </Text>
        </View>

        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ==================================================
              EVENT COVER
          ================================================== */}

          <Text style={styles.sectionHeading}>Event Cover</Text>

          <TouchableOpacity
            style={styles.imagePicker}
            onPress={showImageOptions}
            activeOpacity={0.85}
          >
            {imageUri ? (
              <>
                <Image
                  source={{
                    uri: imageUri,
                  }}
                  style={styles.image}
                />

                <View style={styles.imageOverlay}>
                  <View style={styles.imageEditButton}>
                    <Ionicons name="camera" size={16} color={THEME.white} />

                    <Text style={styles.imageEditText}>Change</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.imagePlaceholderIcon}>
                  <Ionicons
                    name="image-outline"
                    size={30}
                    color={THEME.violet}
                  />
                </View>

                <Text style={styles.imagePlaceholderTitle}>
                  Add Event Cover
                </Text>

                <Text style={styles.imageRatioText}>Recommended 16:9</Text>
              </View>
            )}
          </TouchableOpacity>

          {errors.image && (
            <Text style={styles.imageError}>{errors.image}</Text>
          )}

          {/* ==================================================
              BASIC INFO
          ================================================== */}

          <Text style={styles.sectionHeading}>Basic Information</Text>

          <View style={styles.formCard}>
            <InputField
              label="Event Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Colombo Music Festival"
              error={errors.name}
            />

            <InputField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the event"
              multiline
              numberOfLines={4}
              error={errors.description}
            />

            {/* Category */}

            <Text style={styles.fieldLabel}>Category</Text>

            <TouchableOpacity
              style={[
                styles.dropdownTrigger,

                errors.category ? styles.dropdownError : null,
              ]}
              onPress={() => setCategoryOpen(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownLeft}>
                <View style={styles.smallIconBox}>
                  <Ionicons
                    name="grid-outline"
                    size={16}
                    color={THEME.violet}
                  />
                </View>

                <Text
                  style={[
                    styles.dropdownText,

                    !category && styles.dropdownPlaceholder,
                  ]}
                >
                  {category || "Select event category"}
                </Text>
              </View>

              <Ionicons name="chevron-down" size={18} color={THEME.muted} />
            </TouchableOpacity>

            {errors.category && (
              <Text style={styles.fieldError}>{errors.category}</Text>
            )}
          </View>

          {/* ==================================================
              SCHEDULE
          ================================================== */}

          <Text style={styles.sectionHeading}>Schedule & Venue</Text>

          <View style={styles.formCard}>
            {/* Date */}

            <Text style={styles.fieldLabel}>Event Date</Text>

            <TouchableOpacity
              style={[
                styles.pickerField,

                errors.date && styles.pickerFieldError,
              ]}
              onPress={() => {
                setShowTimePicker(false);

                setShowDatePicker(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.pickerIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={THEME.violet}
                />
              </View>

              <View style={styles.pickerContent}>
                <Text style={styles.pickerSmallLabel}>DATE</Text>

                <Text style={styles.pickerValue}>{formattedDate}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={THEME.muted} />
            </TouchableOpacity>

            {/* Android date picker */}

            {showDatePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {/* iOS date picker */}

            {showDatePicker && Platform.OS === "ios" && (
              <View style={styles.iosPickerBox}>
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />

                <TouchableOpacity
                  style={styles.iosDoneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.iosDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {errors.date && (
              <Text style={styles.fieldError}>{errors.date}</Text>
            )}

            {/* Time */}

            <Text style={[styles.fieldLabel, styles.timeLabel]}>
              Event Time
            </Text>

            <TouchableOpacity
              style={[
                styles.pickerField,

                errors.date && styles.pickerFieldError,
              ]}
              onPress={() => {
                setShowDatePicker(false);

                setShowTimePicker(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.pickerIcon}>
                <Ionicons name="time-outline" size={19} color={THEME.violet} />
              </View>

              <View style={styles.pickerContent}>
                <Text style={styles.pickerSmallLabel}>TIME</Text>

                <Text style={styles.pickerValue}>{formattedTime}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={THEME.muted} />
            </TouchableOpacity>

            {/* Android time picker */}

            {showTimePicker && Platform.OS === "android" && (
              <DateTimePicker
                value={eventDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            {/* iOS time picker */}

            {showTimePicker && Platform.OS === "ios" && (
              <View style={styles.iosPickerBox}>
                <DateTimePicker
                  value={eventDate}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />

                <TouchableOpacity
                  style={styles.iosDoneButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.iosDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Selected schedule preview */}

            <View style={styles.schedulePreview}>
              <View style={styles.schedulePreviewIcon}>
                <Ionicons name="calendar" size={17} color={THEME.violet} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.schedulePreviewLabel}>
                  SELECTED SCHEDULE
                </Text>

                <Text style={styles.schedulePreviewValue}>
                  {formattedDate} · {formattedTime}
                </Text>
              </View>
            </View>

            {/* Location */}

            <View style={styles.locationField}>
              <InputField
                label="Location"
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. BMICH, Colombo"
                error={errors.location}
              />
            </View>
          </View>

          {/* ==================================================
              TICKET DETAILS
          ================================================== */}

          <Text style={styles.sectionHeading}>Ticket Details</Text>

          <View style={styles.formCard}>
            <InputField
              label="Price per Ticket (Rs.)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="e.g. 2500"
              error={errors.price}
            />

            <InputField
              label="Maximum Capacity"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
              placeholder="e.g. 500"
              error={errors.capacity}
            />

            {isEditing && (
              <View style={styles.capacityNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={THEME.violet}
                />

                <Text style={styles.capacityNoteText}>
                  Capacity cannot be reduced below the number of tickets already
                  booked.
                </Text>
              </View>
            )}
          </View>

          {/* Server Error */}

          <ErrorText>{serverError}</ErrorText>

          {/* ==================================================
              SAVE
          ================================================== */}

          <TouchableOpacity
            style={[
              styles.submitButton,

              saving && {
                opacity: 0.6,
              },
            ]}
            onPress={onSubmit}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Ionicons
              name={
                saving
                  ? "hourglass-outline"
                  : isEditing
                    ? "save-outline"
                    : "add-circle-outline"
              }
              size={20}
              color={THEME.white}
            />

            <Text style={styles.submitText}>
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Event"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ======================================================
          CATEGORY MODAL
      ====================================================== */}

      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCategoryOpen(false)}
        >
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>EVENTORA</Text>

                <Text style={styles.modalTitle}>Select Category</Text>
              </View>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setCategoryOpen(false)}
              >
                <Ionicons name="close" size={20} color={THEME.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              style={{
                maxHeight: 410,
              }}
              renderItem={({ item }) => {
                const selected = item === category;

                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryRow,

                      selected && styles.categoryRowSelected,
                    ]}
                    onPress={() => {
                      setCategory(item);

                      setCategoryOpen(false);

                      setErrors((previous) => {
                        const copy = {
                          ...previous,
                        };

                        delete copy.category;

                        return copy;
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.categoryIcon,

                          selected && styles.categoryIconSelected,
                        ]}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color={selected ? THEME.white : THEME.violet}
                        />
                      </View>

                      <Text
                        style={[
                          styles.categoryRowText,

                          selected && styles.categoryRowTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color={THEME.violet}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => (
                <View style={styles.categorySeparator} />
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,

    backgroundColor: THEME.background,
  },

  // ==========================================================
  // Header
  // ==========================================================

  headerBar: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: THEME.navy,

    paddingHorizontal: 16,

    paddingVertical: 14,

    overflow: "hidden",
  },

  headerGlow: {
    position: "absolute",

    width: 190,

    height: 190,

    borderRadius: 95,

    backgroundColor: THEME.violet,

    right: -70,

    top: -110,

    opacity: 0.28,
  },

  backButton: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: THEME.white,

    justifyContent: "center",

    alignItems: "center",
  },

  headerContent: {
    flex: 1,

    marginLeft: 12,
  },

  adminBadge: {
    flexDirection: "row",

    alignItems: "center",

    alignSelf: "flex-start",

    backgroundColor: "rgba(124,58,237,0.18)",

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 15,

    gap: 4,

    marginBottom: 5,
  },

  adminBadgeText: {
    color: "#C4B5FD",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.2,
  },

  headerTitle: {
    color: THEME.white,

    fontSize: 20,

    fontWeight: "900",

    letterSpacing: -0.5,
  },

  content: {
    padding: 16,

    paddingBottom: 40,
  },

  // ==========================================================
  // Sections
  // ==========================================================

  sectionHeading: {
    fontSize: 10,

    fontWeight: "900",

    color: THEME.muted,

    letterSpacing: 1.4,

    textTransform: "uppercase",

    marginBottom: 10,

    marginTop: 20,
  },

  // ==========================================================
  // Image Picker
  // ==========================================================

  imagePicker: {
    height: 210,

    borderRadius: 18,

    backgroundColor: THEME.white,

    overflow: "hidden",

    borderWidth: 1.5,

    borderStyle: "dashed",

    borderColor: THEME.border,

    justifyContent: "center",

    alignItems: "center",
  },

  image: {
    width: "100%",

    height: "100%",
  },

  imageOverlay: {
    position: "absolute",

    top: 0,

    left: 0,

    right: 0,

    bottom: 0,

    justifyContent: "flex-end",

    alignItems: "flex-end",
  },

  imageEditButton: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "rgba(15,23,42,0.92)",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 20,

    margin: 12,
  },

  imageEditText: {
    color: THEME.white,

    fontSize: 12,

    fontWeight: "800",

    marginLeft: 5,
  },

  imagePlaceholder: {
    alignItems: "center",
  },

  imagePlaceholderIcon: {
    width: 66,

    height: 66,

    borderRadius: 20,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 12,
  },

  imagePlaceholderTitle: {
    fontSize: 16,

    fontWeight: "900",

    color: THEME.text,
  },

  imagePlaceholderSubtitle: {
    fontSize: 12,

    color: THEME.muted,

    marginTop: 4,
  },

  imageRatioText: {
    fontSize: 9,

    color: THEME.violet,

    fontWeight: "800",

    marginTop: 7,

    letterSpacing: 0.5,
  },

  imageError: {
    color: THEME.red,

    fontSize: 12,

    marginTop: 7,

    fontWeight: "700",
  },

  // ==========================================================
  // Form
  // ==========================================================

  formCard: {
    backgroundColor: THEME.white,

    borderRadius: 18,

    padding: 16,

    borderWidth: 1,

    borderColor: THEME.border,
  },

  fieldLabel: {
    fontSize: 14,

    color: THEME.text,

    marginBottom: 7,

    fontWeight: "700",
  },

  fieldError: {
    color: THEME.red,

    fontSize: 12,

    marginTop: 6,

    fontWeight: "700",
  },

  // ==========================================================
  // Category Dropdown
  // ==========================================================

  dropdownTrigger: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    borderWidth: 1,

    borderColor: THEME.border,

    borderRadius: 12,

    paddingHorizontal: 12,

    minHeight: 52,

    backgroundColor: THEME.white,
  },

  dropdownError: {
    borderColor: THEME.red,
  },

  dropdownLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  smallIconBox: {
    width: 34,

    height: 34,

    borderRadius: 10,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",

    alignItems: "center",
  },

  dropdownText: {
    flex: 1,

    fontSize: 14,

    color: THEME.text,

    fontWeight: "600",

    marginLeft: 9,
  },

  dropdownPlaceholder: {
    color: THEME.muted,

    fontWeight: "500",
  },

  // ==========================================================
  // Date / Time
  // ==========================================================

  pickerField: {
    minHeight: 64,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: THEME.white,

    borderWidth: 1,

    borderColor: THEME.border,

    borderRadius: 14,

    paddingHorizontal: 12,
  },

  pickerFieldError: {
    borderColor: THEME.red,
  },

  pickerIcon: {
    width: 40,

    height: 40,

    borderRadius: 12,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",

    alignItems: "center",
  },

  pickerContent: {
    flex: 1,

    marginLeft: 11,
  },

  pickerSmallLabel: {
    fontSize: 8,

    fontWeight: "900",

    color: THEME.muted,

    letterSpacing: 1,
  },

  pickerValue: {
    fontSize: 14,

    fontWeight: "800",

    color: THEME.text,

    marginTop: 3,
  },

  timeLabel: {
    marginTop: 16,
  },

  iosPickerBox: {
    marginTop: 8,

    borderWidth: 1,

    borderColor: THEME.border,

    borderRadius: 14,

    backgroundColor: THEME.background,

    overflow: "hidden",
  },

  iosDoneButton: {
    backgroundColor: THEME.violet,

    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 11,
  },

  iosDoneText: {
    color: THEME.white,

    fontWeight: "900",

    fontSize: 13,
  },

  schedulePreview: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: THEME.lavenderSoft,

    borderRadius: 14,

    padding: 12,

    marginTop: 16,
  },

  schedulePreviewIcon: {
    width: 36,

    height: 36,

    borderRadius: 11,

    backgroundColor: THEME.white,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 10,
  },

  schedulePreviewLabel: {
    fontSize: 8,

    color: THEME.violet,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  schedulePreviewValue: {
    fontSize: 12,

    color: THEME.text,

    fontWeight: "700",

    marginTop: 3,
  },

  locationField: {
    marginTop: 18,
  },

  // ==========================================================
  // Capacity
  // ==========================================================

  capacityNote: {
    flexDirection: "row",

    alignItems: "flex-start",

    backgroundColor: THEME.lavenderSoft,

    padding: 11,

    borderRadius: 12,

    marginTop: 4,
  },

  capacityNoteText: {
    flex: 1,

    color: THEME.violet,

    fontSize: 11,

    lineHeight: 16,

    marginLeft: 7,

    fontWeight: "600",
  },

  // ==========================================================
  // Submit
  // ==========================================================

  submitButton: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: THEME.violet,

    paddingVertical: 16,

    borderRadius: 14,

    marginTop: 20,
  },

  submitText: {
    color: THEME.white,

    fontWeight: "900",

    fontSize: 15,

    marginLeft: 8,
  },

  // ==========================================================
  // Category Modal
  // ==========================================================

  modalBackdrop: {
    flex: 1,

    backgroundColor: "rgba(15,23,42,0.65)",

    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: THEME.white,

    borderTopLeftRadius: 26,

    borderTopRightRadius: 26,

    paddingTop: 10,

    paddingBottom: 28,

    paddingHorizontal: 20,
  },

  modalHandle: {
    width: 42,

    height: 4,

    borderRadius: 2,

    backgroundColor: THEME.border,

    alignSelf: "center",

    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 12,
  },

  modalEyebrow: {
    fontSize: 9,

    color: THEME.violet,

    fontWeight: "900",

    letterSpacing: 1.4,

    marginBottom: 3,
  },

  modalTitle: {
    fontSize: 20,

    fontWeight: "900",

    color: THEME.text,
  },

  modalClose: {
    width: 36,

    height: 36,

    borderRadius: 18,

    backgroundColor: THEME.background,

    justifyContent: "center",

    alignItems: "center",
  },

  categoryRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 11,

    paddingHorizontal: 4,
  },

  categoryRowSelected: {
    backgroundColor: THEME.lavenderSoft,

    paddingHorizontal: 8,

    borderRadius: 12,
  },

  categoryLeft: {
    flexDirection: "row",

    alignItems: "center",
  },

  categoryIcon: {
    width: 32,

    height: 32,

    borderRadius: 9,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",

    alignItems: "center",
  },

  categoryIconSelected: {
    backgroundColor: THEME.violet,
  },

  categoryRowText: {
    fontSize: 14,

    color: THEME.text,

    fontWeight: "600",

    marginLeft: 10,
  },

  categoryRowTextSelected: {
    color: THEME.violet,

    fontWeight: "900",
  },

  categorySeparator: {
    height: 1,

    backgroundColor: THEME.background,
  },

  // ==========================================================
  // Loading
  // ==========================================================

  loadingBox: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,

    fontSize: 13,

    color: THEME.muted,

    fontWeight: "600",
  },
});
