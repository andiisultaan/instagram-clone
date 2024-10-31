import React, { useCallback, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, SafeAreaView, RefreshControl } from "react-native";
import Post from "../components/Post";
import { useQuery } from "@apollo/client";
import { GET_POSTS } from "../queries";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const { loading, error, data, refetch } = useQuery(GET_POSTS);
  const [refreshing, setRefreshing] = useState(false); // State untuk mengelola status refresh

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(); // Menjalankan refetch
    setRefreshing(false); // Menetapkan status refreshing kembali ke false setelah selesai
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center" }}>loading...</Text>
      </SafeAreaView>
    );
  }

  if (!loading && error) {
    console.log(error);
    return (
      <SafeAreaView style={styles.container}>
        <Text>{error.message}</Text>
      </SafeAreaView>
    );
  }

  if (!loading && data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            style={styles.headerImage}
            source={require("../assets/instagram-text.png")} // Pastikan path ini benar
            resizeMode="contain"
          />
        </View>
        <FlatList
          data={data?.getPosts}
          renderItem={({ item }) => <Post post={item} navigation={navigation} refetch={refetch} />}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // Status refreshing
              onRefresh={onRefresh} // Fungsi yang dipanggil saat refresh
            />
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    justifyContent: "flex-end", // Align the image to the bottom
    alignItems: "center", // Center the image horizontally
    height: 92, // Set a fixed height for the header
    paddingBottom: 5, // Space below the image
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerImage: {
    width: 120, // Adjust width based on your image size
    height: 40, // Adjust height based on your image size
  },
  post: {
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: 400,
  },
  postActions: {
    flexDirection: "row",
    padding: 10,
  },
  likes: {
    fontWeight: "bold",
    marginLeft: 10,
  },
  caption: {
    marginLeft: 10,
    marginRight: 10,
  },
  viewComments: {
    color: "gray",
    marginLeft: 10,
    marginTop: 5,
  },
  timestamp: {
    color: "gray",
    fontSize: 12,
    marginLeft: 10,
    marginTop: 5,
  },
});
