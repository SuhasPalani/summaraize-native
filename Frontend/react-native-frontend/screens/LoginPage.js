import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '@env';

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    const endpoint = isSignUp ? `${API_URL}/api/signup` : `${API_URL}/api/login`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Success:', data);
        if (isSignUp) {
          Alert.alert('Success', 'Account created successfully. Please sign in.');
          setIsSignUp(false);
        } else {
          navigation.navigate('Interest', { userId: data.user_id });
        }
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
    <LinearGradient
      colors={isDarkMode ? ['#0f0f0f', '#1c1c1e'] : ['#ffffff', '#f5f5f5']}
      style={styles.linearGradient}
    >
      <View style={styles.container}>
        <Text style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
        <TextInput
          style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          keyboardType="default"
          placeholderTextColor={isDarkMode ? '#888' : '#555'}
        />
        <View style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput, styles.passwordContainer]}>
          <TextInput
            style={{ flex: 1, color: isDarkMode ? '#fff' : '#000' }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor={isDarkMode ? '#888' : '#555'}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-slash' : 'eye'}
              type='font-awesome'
              color={isDarkMode ? '#fff' : '#000'}
              size={20}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            checked={rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
            checkedColor={isDarkMode ? '#fff' : '#000'}
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
          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.signUpContainer}>
          <Text style={isDarkMode ? styles.darkSwitchText : styles.lightSwitchText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.signUpLink, isDarkMode ? styles.darkSignUpLink : styles.lightSignUpLink]}>
              {isSignUp ? ' Sign In' : ' Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  darkCheckboxText: {
    color: '#fff',
    marginLeft: 8,
  },
  lightCheckboxText: {
    color: '#000',
    marginLeft: 8,
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
  facebookButton: {
    backgroundColor: '#3b5998',
  },
  googleButton: {
    backgroundColor: '#db4437',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  darkSwitchText: {
    color: '#fff',
  },
  lightSwitchText: {
    color: '#000',
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkSignUpLink: {
    color: '#1e90ff',
  },
  lightSignUpLink: {
    color: '#007bff',
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
