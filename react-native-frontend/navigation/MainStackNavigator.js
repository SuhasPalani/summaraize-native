import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import InterestScreen from '../screens/InterestScreen';
import SelectedTopicsScreen from '../screens/SelectedTopicsScreen';
import FeedScreen from '../screens/FeedScreen';

const Stack = createStackNavigator();

function MainStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Interest"
          component={InterestScreen}
          options={{ title: 'Interest Page' }}
        />
        <Stack.Screen
          name="SelectedTopics"
          component={SelectedTopicsScreen}
          options={{ title: 'Selected Topics' }}
        />
        <Stack.Screen
          name="Feed"
          component={FeedScreen}
          options={{ title: 'Feed' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainStackNavigator;
