import React, { useCallback, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_COMMENT, GET_POST_BY_ID } from "../queries";
import { LIKE_N_UNLIKE_POST } from "../queries";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Comment from "../components/Comments";

const PostDetail = ({ route }) => {
  const [content, setContent] = useState("");
  const { postId } = route.params;

  const { loading, error, data, refetch } = useQuery(GET_POST_BY_ID, {
    variables: {
      input: {
        postId,
      },
    },
    skip: !postId,
  });

  const post = data?.getPostById;
  const tags = post?.tags?.map(tag => `#${tag}`).join(" ");

  const [likeAndUnlikeMutation] = useMutation(LIKE_N_UNLIKE_POST, {
    onCompleted: () => refetch(),
    onError: error => console.log(error),
  });

  const handleLike = async () => {
    try {
      if (postId) {
        await likeAndUnlikeMutation({
          variables: {
            input: { postId },
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [commentMutation] = useMutation(ADD_COMMENT, {
    onCompleted: () => {
      setContent("");
      refetch();
    },
    onError: error => console.log(error),
  });

  const handleComment = async () => {
    try {
      await commentMutation({
        variables: {
          input: {
            content,
            postId,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = timestamp => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const renderItem = ({ item }) => <Comment comment={item} />;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <FlatList
          data={post?.comments || []}
          renderItem={renderItem}
          keyExtractor={item => item.createdAt}
          ListHeaderComponent={
            <>
              <Pressable>
                <View style={styles.header}>
                  <Image source={require("../assets/avatar.jpg")} style={styles.profilePic} />
                  <Text style={styles.username}>{post.Author.username}</Text>
                </View>
                <Image source={{ uri: post.imgUrl }} style={styles.postImage} />
                <View style={styles.actionsContainer}>
                  <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={24} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={24} color="black" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.likes}>{post.likes.length} likes</Text>
                <View style={styles.captionContainer}>
                  <Text style={styles.username}>{post.Author.username}</Text>
                  <Text style={styles.caption}>
                    {post.content} <Text style={styles.tag}>{tags}</Text>
                  </Text>
                </View>
                <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>

                {/* Comment input */}
                <View style={styles.commentInputContainer}>
                  <TextInput style={styles.commentInput} value={content} onChangeText={setContent} placeholder="Add a comment..." />
                  <TouchableOpacity onPress={handleComment}>
                    <Text style={styles.postButton}>Post</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 10,
  },
  actionButton: {
    marginRight: 15,
  },
  likes: {
    fontWeight: "bold",
    padding: 10,
  },
  captionContainer: {
    flexDirection: "row",
    padding: 10,
    paddingTop: 0,
  },
  caption: {
    marginLeft: 5,
  },
  timestamp: {
    color: "gray",
    fontSize: 12,
    padding: 10,
    paddingTop: 0,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  postButton: {
    color: "#3897f0",
    fontWeight: "bold",
  },
  tag: {
    color: "#2c7bbd",
  },
});

export default PostDetail;
