import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const Comment = ({ comment }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/avatar.jpg")} style={styles.avatar} />
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.username}>{comment.username}</Text>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 16,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  username: {
    fontWeight: "bold",
    marginRight: 8,
  },
  commentText: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 4,
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginRight: 16,
  },
  replyText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "gray",
    marginRight: 16,
  },
});

export default Comment;
