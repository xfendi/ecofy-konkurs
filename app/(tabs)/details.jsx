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

import { primaryColor } from "../../config.json"; 
import { UseMap } from "../../context/MapContext"; 
import { UserAuth } from "../../context/AuthContext"; 
import { db } from "../../firebase"; 
import { parse } from "date-fns";
import useGeoLocation from "../../context/GeoLocationContext"

const Details = () => {
  const { location } = useGeoLocation(); 
  const [event, setEvent] = useState(null);
  const [isLike, setIsLike] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [distance, setDistance] = useState(null); 
  const [isConfirmed, setIsConfirmed] = useState(false); // New state for attendance confirmation

  const params = useLocalSearchParams();
  const router = useRouter();
  const { eventId } = params; 
  const { setSelectedEvent } = UseMap(); 
  const { user } = UserAuth(); 
  const { width } = Dimensions.get("window");

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (event?.date) {
      checkShowConfirmButton();
    }
  }, [event]);

  useEffect(() => {
    if (event && location) {
      calculateDistance();
    }
  }, [event, location]);

  const onRefresh = () => {
    setIsRefreshing(true);
    router.replace("/details", { eventId });
    setTimeout(() => {
      setIsRefreshing(false); 
    }, 1000);
  };

  const fetchEventDetails = async (id) => {
    try {
      const eventRef = doc(db, "events", id.toString());
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        const eventDetails = eventSnap.data();
        setEvent(eventDetails);
        setIsConfirmed(eventDetails.confirmedUsers?.includes(user.uid) || false);
        const likes = eventDetails.likes || [];
        setIsLike(likes.includes(user.uid));
      } else {
        console.log("Event not found");
      }
    } catch (error) {
      console.error("Błąd podczas ładowania szczegółów wydarzenia:", error);
    }
  };

  const calculateDistance = () => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const { latitude: lat1, longitude: lon1 } = location.coords;
    const { latitude: lat2, longitude: lon2 } = event.coordinates;

    const R = 6371; 
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistance(distance.toFixed(2)); 
  };

  const checkShowConfirmButton = () => {
    const currentTime = new Date();
    const eventDate = parse(event.date, "d.M.yyyy HH:mm:ss", new Date());
    const timeDifferenceInHours = (eventDate - currentTime) / (1000 * 60 * 60);
    setShowConfirmButton(timeDifferenceInHours <= 1 && timeDifferenceInHours > 0);
  };

  const handleConfirmAttendance = async () => {
    if (distance <= 0.1) {
      try {
        const eventRef = doc(db, "events", event.id.toString());
        await updateDoc(eventRef, {
          confirmedUsers: arrayUnion(user.uid), // Add user ID to confirmed users array
        });
        setIsConfirmed(true); // Update local state
        Alert.alert("Potwierdzono przybycie", `Potwierdziłeś swoje przybycie na ${event.title}`);
      } catch (error) {
        console.error("Błąd przy potwierdzaniu przybycia:", error);
        Alert.alert("Błąd", "Nie udało się potwierdzić przybycia. Spróbuj ponownie.");
      }
    } else {
      Alert.alert("Za daleko", "Musisz być w promieniu 100 metrów od wydarzenia, aby potwierdzić przybycie.");
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
                  {event.coordinates.latitude.toFixed(3)}, {event.coordinates.longitude.toFixed(3)}
                </Text>
              </View>
            )}
            {distance && (
              <View>
                <Text className="font-semibold">Odległość</Text>
                <Text className="w-80 text-gray-500">
                  {distance} km
                </Text>
              </View>
            )}
          </View>
          {showConfirmButton&&isLike && (
            <View className="mb-5">
              <TouchableOpacity
                onPress={isConfirmed ? null : handleConfirmAttendance}
                className="p-5 rounded-full"
                style={{
                  backgroundColor: isConfirmed ? "gray" : "green",
                }}
                disabled={isConfirmed}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {isConfirmed ? "Już potwierdzono przybycie" : "Potwierdź przybycie"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
