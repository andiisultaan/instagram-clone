import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@apollo/client";
import { LIKE_N_UNLIKE_POST } from "../queries";
import { getTimeAgo } from "../utils/getTimeAgo";

const Post = ({ post, navigation, refetch }) => {
  const tags = post?.tags?.map(tag => `#${tag}`).join(" ");

  const [likeAndUnlikeMutation, { likeLoading, likeError, likeData }] = useMutation(LIKE_N_UNLIKE_POST, {
    onCompleted: _ => {
      refetch();
    },
    onError: error => {
      console.log(error);
    },
  });

  const handleLike = async postId => {
    try {
      if (postId) {
        await likeAndUnlikeMutation({
          variables: {
            input: {
              postId,
            },
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Pressable onPress={() => navigation.navigate("PostDetail", { postId: post["_id"] })}>
      <View style={styles.post}>
        <View style={styles.postHeader}>
          <Pressable
            onPress={() =>
              navigation.navigate("ProfileScreen", {
                userId: post.Author["_id"],
              })
            }
            style={({ pressed }) => [
              styles.header,
              pressed && styles.pressedHeader, // Efek saat ditekan
            ]}
            android_ripple={{ color: "#ddd" }} // Menambahkan efek ripple di Android
          >
            <Image source={require("../assets/avatar.jpg")} style={styles.avatar} />
            <Text style={styles.username}>{post.Author.username}</Text>
          </Pressable>
        </View>
        <Image source={{ uri: post.imgUrl }} style={styles.postImage} />
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.iconSpacing} onPress={() => handleLike(post._id)}>
            <Ionicons name="heart-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconSpacing}>
            <Ionicons name="chatbubble-outline" size={23} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.likes}>{post.likes.length} likes</Text>
        <Text style={styles.caption}>
          <Text style={styles.username}>{post.Author.username}</Text> {post.content} <Text style={styles.tag}>{tags}</Text>
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("PostDetail", { postId: post["_id"] })}>
          <Text style={styles.viewComments}>View all {post.comments.length} comments</Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{getTimeAgo(post.createdAt)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  post: {
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  pressedHeader: {
    opacity: 0.7, // Mengurangi opasitas saat ditekan
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
    marginBottom: 5,
  },
  caption: {
    marginLeft: 10,
    marginRight: 10,
  },
  iconSpacing: {
    marginRight: 5, // Beri jarak 5px antar icon
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
  tag: {
    color: "#2c7bbd",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Post;
