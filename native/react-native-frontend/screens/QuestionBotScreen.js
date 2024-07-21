import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // or use any other icon set
import { API_URL } from "@env";

export default function QuestionBotScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim()) {
      // Add user message
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, type: "user" },
      ]);
      setInput("");
      setLoading(true);

      try {
        // Send message to the backend
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        });

        // Check if the response is okay
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Try to parse JSON
        const data = await response.json();

        // Add bot response
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.response, type: "bot" },
        ]);
      } catch (error) {
        console.error("Error:", error.message);
        // Optionally, display an error message to the user
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Sorry, there was an error processing your request.",
            type: "bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.message,
              message.type === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Icon name="paper-plane" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
    maxWidth: "75%",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6A0D91", // Vibrant purple
    borderColor: "#4A0072", // Darker purple for border
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333333", // Dark grey
    borderColor: "#000000", // Black for border
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF", // White text for both user and bot messages
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
    color: "#000000",
  },
  sendButton: {
    backgroundColor: "#6A0D91", // Match with user message color
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  loadingText: {
    marginTop: 5,
    fontSize: 16,
    color: "#333",
  },
});
