import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { API_URL } from "@env";

export default function QuestionBotScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputAreaHeight, setInputAreaHeight] = useState(60); // Default height of the input area

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true);
      // Calculate height dynamically if needed, or set a fixed smaller value
      setInputAreaHeight(e.endCoordinates.height - 20); // Adjust `-20` as needed
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      setInputAreaHeight(60); // Reset to default height
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim()) {
      setMessages((prevMessages) => [...prevMessages, { text: input, type: "user" }]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, { text: data.response, type: "bot" }]);
      } catch (error) {
        console.error("Error:", error.message);
        setMessages((prevMessages) => [...prevMessages, { text: "Sorry, there was an error processing your request.", type: "bot" }]);
      } finally {
        setLoading(false);
        // Ensure input area returns to original position after sending
        setTimeout(() => {
          setInputAreaHeight(60); // Adjust or remove this value to fine-tune the position
        }, 100); // Small delay to ensure layout update
      }
    }
  }, [input]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Use "height" for Android
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Adjust if needed for Android
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.messagesContainer}
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContentContainer}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.message,
                    message.type === "user" ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  <Icon
                    name={message.type === "user" ? "user" : "cogs"}
                    size={30}
                    color="#fff"
                    style={styles.messageIcon}
                  />
                  <View style={styles.messageTextWrapper}>
                    <Text style={styles.messageText}>{message.text}</Text>
                  </View>
                </View>
              ))}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#333" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              )}
            </ScrollView>
            <View
              style={[
                styles.inputContainer,
                { marginBottom: keyboardVisible ? inputAreaHeight : 0 },
              ]}
            >
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#888"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Icon name="paper-plane" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  innerContainer: {
    flex: 1,
    flexDirection: "column",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  message: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
    maxWidth: "75%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6A0D91",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333333",
  },
  messageTextWrapper: {
    flex: 1,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  messageIcon: {
    marginRight: 10,
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
    backgroundColor: "#6A0D91",
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
