import { StyleSheet, View, Image, Text, TextInput, Pressable, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";
import * as SecureStore from "expo-secure-store";
import { LoginContext } from "../context/LoginContext";

const LoginScreen = ({ navigation }) => {
  const { setIsLoggedIn } = useContext(LoginContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginMutation, { loading, error, data }] = useMutation(LOGIN, {
    onCompleted: async res => {
      let access_token = null;

      if (res && res.login && res.login.access_token) {
        access_token = res.login.access_token;
      }

      await SecureStore.setItemAsync("access_token", access_token);

      let userId = null;

      if (res && res.login && res.login.userId) {
        userId = res.login.userId;
      }

      await SecureStore.setItemAsync("userId", userId);

      setIsLoggedIn(true);
    },
    onError: error => {
      console.error(error);
    },
  });

  const onPressLogin = async () => {
    if (!username || !password) {
      Alert.alert("Email or password is required");
      return;
    }

    const usernameWithoutSpace = username.replace(" ", "");

    try {
      await loginMutation({
        variables: {
          input: {
            username: usernameWithoutSpace,
            password,
          },
        },
      });
    } catch (err) {
      console.error("Error during login mutation:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView>
          <Image source={require("../assets/instagram-text.png")} style={styles.logo} />
          <TextInput style={styles.textInput} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput style={styles.textInput} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none" />
          <TouchableOpacity style={styles.loginButton} onPress={onPressLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>
          <Text style={styles.orText}>OR</Text>
          <Pressable>
            <Text style={styles.signUpText} onPress={() => navigation.navigate("Register")}>
              Don't have an account? Sign up.
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 40,
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: "contain",
    marginBottom: 20,
    alignSelf: "center",
  },
  textInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#f6f7f8",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 10,
    color: "#333",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#3797ef",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    color: "#8e8e8e",
    marginBottom: 20,
    alignSelf: "center",
  },
  signUpText: {
    color: "#3797ef",
    alignSelf: "center",
  },
});

export default LoginScreen;
