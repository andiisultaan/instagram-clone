import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ADD_POST } from "../queries";

const AddPostScreen = ({ navigation }) => {
  const [imgUrl, setImgUrl] = useState("");
  const [content, setContent] = useState("");
  const [tagsString, setTagsString] = useState("");

  const [addPostMutation, { loading, error, data }] = useMutation(ADD_POST, {
    onCompleted: async res => {
      setImgUrl("");
      setContent("");
      setTagsString("");

      navigation.navigate("Home");
    },
    onError: error => {
      console.log(error);
    },
  });

  const handlePost = async () => {
    if (!imgUrl || !content) {
      Alert.alert("Please enter an image URL and add a caption.");
      return;
    }

    let tags;

    if (tagsString.length > 0) {
      tags = tagsString
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
    }

    try {
      await addPostMutation({
        variables: {
          input: {
            imgUrl,
            content,
            tags,
          },
        },
      });
    } catch (error) {
      console.log("Error during add post", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Upload New Post</Text>
          </View>

          {/* Image URL Input */}
          <TextInput style={styles.urlInput} placeholder="Enter image URL" value={imgUrl} onChangeText={setImgUrl} />

          {/* Image Preview */}
          {imgUrl ? (
            <Image source={{ uri: imgUrl }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Image preview will appear here</Text>
            </View>
          )}

          {/* Caption Input */}
          <TextInput style={styles.captionInput} placeholder="Write a caption..." value={content} onChangeText={setContent} multiline />

          {/* Tag Input */}
          <TextInput style={styles.tagInput} placeholder="Add tags (separated by commas)" value={tagsString} onChangeText={setTagsString} />

          {/* Post Button */}
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    backgroundColor: "#fff", // Background color for the header
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40, // Extra padding at the bottom for scrollable space
  },
  urlInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePlaceholderText: {
    color: "#888",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    height: 100,
    textAlignVertical: "top",
  },
  tagInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: "#3897f0",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddPostScreen;
