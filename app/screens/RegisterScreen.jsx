import { StyleSheet, View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { REGISTER } from "../queries";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [RegisterMutation, { loading, data, error }] = useMutation(REGISTER, {
    onCompleted: async res => {
      navigation.navigate("Login");

      Alert.alert("Success Regiter");
    },
    onError: error => {
      console.error(error);
    },
  });

  const onRegisterPress = async () => {
    if (!name || !username || !email || !password) {
      Alert.alert("Name, username, email or password is required");
      return;
    }

    try {
      await RegisterMutation({
        variables: {
          input: {
            name,
            username,
            email,
            password,
          },
        },
      });
    } catch (err) {
      console.error("Error during register:", err);
    }
  };

  const onLoginPress = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView>
          <Text style={styles.headerText}>Create an account</Text>

          <TextInput style={styles.textInput} placeholder="Username" value={username} onChangeText={setUsername} />
          <TextInput style={styles.textInput} placeholder="Name" value={name} onChangeText={setname} />
          <TextInput style={styles.textInput} placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput style={styles.textInput} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <Pressable style={styles.signUpButton} onPress={onRegisterPress}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </Pressable>

          <Text style={styles.orText}>OR</Text>

          <Pressable onPress={onLoginPress}>
            <Text style={styles.loginText}>Already have an account? Log in.</Text>
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
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  textInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#f6f7f8",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#333",
  },
  signUpButton: {
    width: "100%",
    backgroundColor: "#3797ef",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  signUpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    color: "#8e8e8e",
    marginBottom: 20,
    alignSelf: "center",
  },
  loginText: {
    color: "#3797ef",
    alignSelf: "center",
  },
});

export default RegisterScreen;
