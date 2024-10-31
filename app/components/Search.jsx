import { TouchableOpacity, View, StyleSheet, Image, Text } from "react-native";

const Search = ({ user, navigation }) => {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ProfileScreen", {
          userId: user["_id"],
        })
      }
    >
      <View style={styles.resultContainer}>
        <Image source={user.avatarUrl ? { uri: user.avatarUrl } : require("../assets/avatar.jpg")} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.fullname}>{user.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  fullname: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
});

export default Search;
