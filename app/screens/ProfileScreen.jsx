import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable, FlatList, Dimensions } from "react-native";
import { LoginContext } from "../context/LoginContext";
import * as SecureStore from "expo-secure-store";
import { useMutation, useQuery } from "@apollo/client";
import { FOLLOW_N_UNFOLLOW_USER, GET_USER_BY_ID } from "../queries";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

export default function ProfileScreen({ route, navigation }) {
  const { setIsLoggedIn } = useContext(LoginContext);
  const [storedUserId, setStoredUserId] = useState(null);
  const { userId } = route.params;

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await SecureStore.getItemAsync("userId");
      setStoredUserId(id);
    };
    fetchUserId();
  }, []);

  const { loading, error, data, refetch } = useQuery(GET_USER_BY_ID, {
    variables: {
      input: {
        userId,
      },
    },
    skip: !userId,
  });

  const [followAndUnfollowMutation, { followLoading, followError, followData }] = useMutation(FOLLOW_N_UNFOLLOW_USER, {
    onCompleted: async res => {
      refetch();
    },
    onError: async error => {
      console.log(error);
    },
  });

  const handleFollow = async () => {
    try {
      followAndUnfollowMutation({
        variables: {
          input: {
            followingId: userId,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setIsLoggedIn(false);
    navigation.navigate("Login");
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity style={styles.postThumbnail} onPress={() => navigation.navigate("PostDetail", { postId: item._id })}>
      <Image source={{ uri: item.imgUrl }} style={styles.postImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Error loading profile</Text>
      </SafeAreaView>
    );
  }

  if (data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{data.getUserById.username}</Text>
        </View>
        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.profileContainer}>
                <Image source={require("../assets/avatar.jpg")} style={styles.avatar} />
                <View style={styles.profileInfo}>
                  <View>
                    <Text style={styles.name}>{data?.getUserById?.name}</Text>
                    <Text style={styles.username}>@{data?.getUserById?.username}</Text>
                  </View>
                  {storedUserId !== userId ? (
                    <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
                      <Text style={styles.followButtonText}>Follow</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                      <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{data.getUserById.Posts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{data.getUserById.Followers.length}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{data.getUserById.Followings.length}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
              <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tabButton}>
                  <Ionicons name="grid-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </>
          }
          data={data.getUserById.Posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          numColumns={3}
          columnWrapperStyle={styles.postRow}
          ListEmptyComponent={<Text style={styles.noPostsText}>No posts yet</Text>}
          onRefresh={refetch} // Call refetch when user pulls down
          refreshing={loading} // Show loading state while refetching
        />
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    color: "gray",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
  },
  statLabel: {
    color: "gray",
  },
  followButton: {
    backgroundColor: "#24a0ed",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  followButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: "#363636",
    borderWidth: 1,
  },
  logoutButtonText: {
    color: "black",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 10,
  },
  tabButton: {
    padding: 10,
  },
  postRow: {
    justifyContent: "space-between",
    paddingHorizontal: 1,
  },
  postThumbnail: {
    width: (windowWidth - 4) / 3,
    height: (windowWidth - 4) / 3,
    marginBottom: 2,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  noPostsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
});
