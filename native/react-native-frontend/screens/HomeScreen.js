import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default class HomeScreen extends Component {
  state = {
    title: '',
    tagline: '',
    description: ''
  };

  componentDidMount() {
    fetch('http://192.168.0.200:5000/api/summary')
      .then(response => response.json())
      .then(data => {
        this.setState({
          title: data.title,
          tagline: data.tagline,
          description: data.description
        });
      })
      .catch(error => console.error('Error fetching summary:', error));
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.state.title}</Text>
        <Text style={styles.tagline}>{this.state.tagline}</Text>
        <Text style={styles.description}>{this.state.description}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.props.navigation.navigate('Interest')}
        >
          <Text style={styles.buttonText}>Try It Now</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black',
  },
  tagline: {
    fontSize: 18,
    color: 'red',
    marginVertical: 10,
  },
  description: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#FF6666',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
