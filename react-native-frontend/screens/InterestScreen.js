import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function InterestScreen() {
  const [interest, setInterest] = useState('');

  const handleSubmit = () => {
    fetch('http://192.168.0.200:5000/api/interest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interest }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        alert(data.message);
      })
      .catch(error => console.error('Error submitting interest:', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tell us about your interest:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your interest"
        value={interest}
        onChangeText={setInterest}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    width: '80%',
    paddingHorizontal: 10,
  },
});
