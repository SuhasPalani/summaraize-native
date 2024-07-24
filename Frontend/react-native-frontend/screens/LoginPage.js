import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Switch} from 'react-native';

import { CheckBox } from 'react-native-elements';


const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [rememberMe, setRememberMe] = useState(false); // State for checkbox



  const handleSubmit = async () => {
    const endpoint = isSignUp ? 'http://192.168.0.11:5000/api/signup' : 'http://192.168.0.11:5000/api/login';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Success:', data);
        // Alert.alert('Success', data.message);
        // Navigate to home or another screen upon successful login/sign-up
        navigation.navigate('Interest');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

 const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </Text>
      <TextInput
        style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor={isDarkMode ? '#888' : '#555'}
      />
      <TextInput
        style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={isDarkMode ? '#888' : '#555'}
      />
      <View style={styles.checkboxContainer}>
        <CheckBox
          value={rememberMe}
          onValueChange={setRememberMe}
          tintColors={{ true: isDarkMode ? '#fff' : '#000', false: isDarkMode ? '#fff' : '#000' }}
        />
        <Text style={isDarkMode ? styles.darkCheckboxText : styles.lightCheckboxText}>Remember me</Text>
      </View>
      <TouchableOpacity>
        <Text style={isDarkMode ? styles.darkForgotPassword : styles.lightForgotPassword}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]} onPress={handleSubmit}>
        <Text style={isDarkMode ? styles.darkButtonText : styles.lightButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>
      <View style={styles.orContainer}>
        <Text style={isDarkMode ? styles.darkOrText : styles.lightOrText}>Or Sign in with</Text>
      </View>
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={[styles.socialButton, isDarkMode ? styles.darkSocialButton : styles.lightSocialButton]}>
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, isDarkMode ? styles.darkSocialButton : styles.lightSocialButton]}>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={isDarkMode ? styles.darkSwitchText : styles.lightSwitchText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
      <View style={styles.themeToggleContainer}>
        <Text style={isDarkMode ? styles.darkThemeToggleText : styles.lightThemeToggleText}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          thumbColor={isDarkMode ? '#fff' : '#000'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#1c1c1e',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 32,
    marginBottom: 32,
    fontWeight: 'bold',
  },
  darkHeader: {
    color: '#fff',
  },
  lightHeader: {
    color: '#000',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  darkInput: {
    borderColor: '#333',
    backgroundColor: '#2c2c2e',
    color: '#fff',
  },
  lightInput: {
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align items center to ensure checkbox and text are aligned
    width: '100%',
    marginBottom: 16,
  },
  darkCheckboxText: {
    color: '#fff',
    marginLeft: 8, // Space between checkbox and text
  },
  lightCheckboxText: {
    color: '#000',
    marginLeft: 8, // Space between checkbox and text
  },
  darkForgotPassword: {
    color: '#1e90ff',
  },
  lightForgotPassword: {
    color: '#007bff',
  },
  button: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
  },
  darkButton: {
    backgroundColor: '#007BFF',
  },
  lightButton: {
    backgroundColor: '#007bff',
  },
  darkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lightButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    marginBottom: 16,
  },
  darkOrText: {
    color: '#fff',
  },
  lightOrText: {
    color: '#000',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  socialButton: {
    width: '48%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  darkSocialButton: {
    backgroundColor: '#3b5998',
  },
  lightSocialButton: {
    backgroundColor: '#3b5998',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  darkSwitchText: {
    color: '#fff',
  },
  lightSwitchText: {
    color: '#000',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  darkThemeToggleText: {
    color: '#fff',
    marginRight: 8,
  },
  lightThemeToggleText: {
    color: '#000',
    marginRight: 8,
  },
});

export default LoginPage;