import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Switch, 
  Animated 
} from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '@env';
import { SessionContext } from '../Context/SessionContext';
import LoadingScreen from '../loading/LoadingScreen';

const topics = [
  { name: 'Artificial Intelligence', icon: 'cogs' },
  { name: 'Politics', icon: 'balance-scale' },
  { name: 'Sports', icon: 'soccer-ball-o' },
  { name: 'Crypto', icon: 'bitcoin' },
  { name: 'Stock', icon: 'line-chart' },
  { name: 'Business and Finance', icon: 'briefcase' },
  { name: 'Science', icon: 'flask' },
  { name: 'Climate Change', icon: 'tree' },
  { name: 'Entertainment', icon: 'film' },
  { name: 'Music', icon: 'music' },
  { name: 'Technology', icon: 'laptop' },
  { name: 'Travel', icon: 'plane' },
  { name: 'Renewable Energy', icon: 'leaf' },
  { name: 'Space Exploration', icon: 'rocket' },
  { name: 'Electric Vehicles', icon: 'car' }
];

const LoginPage = ({ navigation }) => {
  const { saveSessionID } = useContext(SessionContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    const endpoint = isSignUp ? `${API_URL}/api/signup` : `${API_URL}/api/login`;
    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const json_response = await response.json();
      if (json_response.status === "success") {
        if (isSignUp) {
          Alert.alert('Success', 'Account created successfully. Please sign in.');
          setIsSignUp(false);
        } else {
          await saveSessionID(json_response.token);
          const userInterests = await check_user_interest(json_response.token);
          if (userInterests.length === 0) {
            navigation.navigate('Interest');
          } else {
            navigation.navigate('SelectedTopics', {
              selectedTopics: userInterests.map(topic => topics.find(t => t.name === topic))
            });
          }
        }
      } else {
        throw new Error(json_response.message);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error:', error.message);
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  const check_user_interest = async (token) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/get_user_interests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    setLoading(false);
    const json_response = await response.json();
    return json_response.interests;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <LinearGradient
      colors={isDarkMode ? ['#1a1a2e', '#16213e'] : ['#f0f2f5', '#e2e8f0']}
      style={styles.linearGradient}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          <Text style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          
          <TextInput
            style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]}
            placeholder="Username"
            placeholderTextColor={isDarkMode ? '#a0aec0' : '#718096'}
            value={username}
            onChangeText={setUsername}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, isDarkMode ? styles.darkInput : styles.lightInput]}
              placeholder="Password"
              placeholderTextColor={isDarkMode ? '#a0aec0' : '#718096'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-slash' : 'eye'}
                type="font-awesome"
                color={isDarkMode ? '#a0aec0' : '#718096'}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.checkboxContainer}>
            <CheckBox
              checked={rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
              checkedColor={isDarkMode ? '#60a5fa' : '#3b82f6'}
              containerStyle={styles.checkbox}
            />
            <Text style={isDarkMode ? styles.darkCheckboxText : styles.lightCheckboxText}>
              Remember me
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, isDarkMode ? styles.darkButton : styles.lightButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={[styles.switchText, isDarkMode ? styles.darkSwitchText : styles.lightSwitchText]}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.themeSwitchContainer}>
          <Text style={isDarkMode ? styles.darkThemeText : styles.lightThemeText}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#60a5fa" }}
            thumbColor={isDarkMode ? "#3b82f6" : "#f4f3f4"}
          />
        </View>
      </Animated.View>
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  darkHeader: {
    color: '#fff',
  },
  lightHeader: {
    color: '#1a202c',
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
    borderColor: '#4a5568',
    backgroundColor: 'rgba(74, 85, 104, 0.2)',
    color: '#fff',
  },
  lightInput: {
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    color: '#1a202c',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  darkCheckboxText: {
    color: '#e2e8f0',
  },
  lightCheckboxText: {
    color: '#4a5568',
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
    backgroundColor: '#3b82f6',
  },
  lightButton: {
    backgroundColor: '#4299e1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 16,
  },
  darkSwitchText: {
    color: '#60a5fa',
  },
  lightSwitchText: {
    color: '#3b82f6',
  },
  themeSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  darkThemeText: {
    color: '#e2e8f0',
    marginRight: 8,
  },
  lightThemeText: {
    color: '#4a5568',
    marginRight: 8,
  },
});

export default LoginPage;