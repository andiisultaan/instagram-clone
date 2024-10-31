import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LoginContext } from "../context/LoginContext";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, View } from "react-native";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SearchUsers from "../screens/SearchScreen";
import AddPostScreen from "../screens/AddPostScreen";
import PostDetail from "../screens/PostDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Stack Holder
const StackHolder = () => {
  const { isLoggedIn } = useContext(LoginContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeStack.Screen name="SearchUsers" component={SearchUsers} />
      <HomeStack.Screen name="PostDetail" component={PostDetail} />
      <HomeStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </HomeStack.Navigator>
  );
};

// Main Tabs
const MainTabs = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSecureStoreItem = async key => {
      try {
        const value = await SecureStore.getItemAsync(key);
        setUserId(value || null);
      } catch (error) {
        console.error("Error retrieving value:", error);
      } finally {
        setLoading(false);
      }
    };

    getSecureStoreItem("userId");
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    ); // Show loading indicator while fetching data
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "SearchUsers") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Create") {
            iconName = focused ? "add-circle-sharp" : "add-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#888",
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="SearchUsers" component={SearchUsers} />
      <Tab.Screen name="Create" component={AddPostScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId }} // Send userId to ProfileScreen
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default StackHolder;
