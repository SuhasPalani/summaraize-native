import React, { useState, useRef, useCallback, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { API_URL } from "@env";
import { SessionContext } from '../Context/SessionContext';

export default function QuestionBotScreen({route}) {
  const {video_id}=route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const flatListRef = useRef(null);
  const { sessionID } = useContext(SessionContext);

  const handleSend = useCallback(async () => {
    if (input.trim()) {
      const newMessage = { text: input, type: "user" };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput("");
      setInputHeight(40);
      setLoading(true);

      try {
        const response = await fetch(`http://192.168.184.34:5000/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${sessionID}`
          },
          body: JSON.stringify({
            question: input,
            recordId: video_id,
          }),
        });
        const responseJSON = await response.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: responseJSON["answer"], type: "bot" },
        ]);
      } catch (error) {
        console.error("Error:", error.message);
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
  }, [input, sessionID,video_id]);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.message,
        item.type === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Icon
        name={item.type === "user" ? "user" : "cogs"}
        size={24}
        color="#fff"
        style={styles.messageIcon}
      />
      <View style={styles.messageTextWrapper}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  const handleContentSizeChange = (event) => {
    setInputHeight(Math.max(40, event.nativeEvent.contentSize.height));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6A0D91" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { height: Math.min(120, inputHeight) }]}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            onSubmitEditing={handleSend}
            multiline
            onContentSizeChange={handleContentSizeChange}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Icon name="paper-plane" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 10,
    paddingBottom: 60,
  },
  message: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
    alignItems: "flex-end",
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
    maxHeight: 120,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: "#6A0D91",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingText: {
    marginTop: 5,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
