import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";

import { primaryColor } from "../../config.json"; // Ścieżka do config.json
import { UseMap } from "../../context/MapContext"; // Ścieżka do kontekstu MapContext
import { UserAuth } from "../../context/AuthContext"; // Ścieżka do kontekstu AuthContext
import { db } from "../../firebase"; // Ścieżka do pliku firebase

const Details = () => {
  const [event, setEvent] = useState(null);
  const [isLike, setIsLike] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const params = useLocalSearchParams();
  const router = useRouter();

  const { eventId } = params; // Parametr eventId
  const { setSelectedEvent } = UseMap(); // Access the context
  const { user } = UserAuth(); // Pobieranie użytkownika z AuthContext
  const { width } = Dimensions.get("window");

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  const onRefresh = () => {
    setIsRefreshing(true);

    router.replace("/details", { eventId });
    setTimeout(() => {
      setIsRefreshing(false); // Zatrzymanie odświeżania
    }, 1000); // Czas odświeżania w milisekundach
  };

  const fetchEventDetails = async (id) => {
    try {
      const eventRef = doc(db, "events", id.toString());
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const eventDetails = eventSnap.data();
        setEvent(eventDetails);

        const likes = eventDetails.likes || [];
        setIsLike(likes.includes(user.uid));
      } else {
        console.log("Event not found");
      }
    } catch (error) {
      console.error("Błąd podczas ładowania szczegółów wydarzenia:", error);
    }
  };

  const handleShowOnMap = () => {
    if (event) {
      setSelectedEvent(event);
      router.replace("/(tabs)/map");
    }
  };

  const handleLikeToggle = async () => {
    const eventRef = doc(db, "events", event.id.toString());
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      const likes = eventData.likes || [];

      if (likes.includes(user.uid)) {
        await updateDoc(eventRef, {
          likes: arrayRemove(user.uid),
        });
        setIsLike(false);
      } else {
        await updateDoc(eventRef, {
          likes: arrayUnion(user.uid),
        });
        setIsLike(true);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "events", id.toString()));
      Alert.alert("Sukces", "Pomyślnie usunięto wydarzenie!");
      router.replace("/");
    } catch (e) {
      console.error("Błąd przy usuwaniu wydarzenia:", e);
      Alert.alert("Błąd", "Nie udało się usunąć wydarzenia: ", e.message);
    }
  };

  const showDeleteAlert = (id) => {
    Alert.alert(
      "Potwierdź usunięcie",
      "Czy na pewno chcesz usunąć to wydarzenie?",
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Usuń",
          onPress: () => handleDelete(id),
        },
      ],
      { cancelable: true }
    );
  };

  if (!event) {
    return (
      <View>
        <Text>Ładowanie szczegółów...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className={Platform.OS === "android" ? "p-5" : "px-5"}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex flex-col gap-5">
          {event.photoURL && (
            <Image
              source={{ uri: event.photoURL }}
              className="w-full rounded-3xl"
              style={{ height: width - 40 }}
            />
          )}

          <View className="flex flex-row justify-between">
            <View>
              <Text className="text-3xl font-semibold">{event.title}</Text>
              <Text className="w-80 text-gray-500 mt-2">{event.address}</Text>
            </View>
            <View>
              {event.host === user.uid ? (
                <TouchableOpacity onPress={() => showDeleteAlert(event.id)}>
                  <Feather name="trash" size={24} color="red" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleLikeToggle}>
                  {isLike ? (
                    <AntDesign name="heart" size={24} color="red" />
                  ) : (
                    <Feather name="heart" size={24} color="black" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="flex flex-col gap-5 p-5 bg-white rounded-3xl w-full">
            {event.description && (
              <Text className="w-80 text-gray-500">{event.description}</Text>
            )}
            {event.date && (
              <View>
                <Text className="font-semibold">Data</Text>
                <Text className="w-80 text-gray-500">{event.date}</Text>
              </View>
            )}
            {event.coordinates.latitude && event.coordinates.longitude && (
              <View>
                <Text className="font-semibold">Koordynaty</Text>
                <Text className="w-80 text-gray-500">
                  {event.coordinates.latitude.toFixed(3)},{" "}
                  {event.coordinates.longitude.toFixed(3)}
                </Text>
              </View>
            )}
          </View>

          <View className={Platform.OS === "ios" ? "mb-[50px]" : "mb-[84px]"}>
            <TouchableOpacity
              onPress={handleShowOnMap}
              className="p-5 rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Text className="text-white text-lg font-semibold text-center">
                Pokaż na mapie
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Details;
