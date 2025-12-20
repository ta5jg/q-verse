import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, Globe, ArrowRightLeft, Settings } from 'lucide-react-native';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import WalletScreen from './src/screens/WalletScreen';
import MarketScreen from './src/screens/MarketScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0a0a0f',
            borderTopColor: '#1f2937',
            height: 85,
            paddingBottom: 20,
            paddingTop: 10
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#6b7280',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color }) => <Globe color={color} size={24} />,
            tabBarLabel: 'Ecosystem'
          }}
        />
        <Tab.Screen 
          name="Wallet" 
          component={WalletScreen} 
          options={{
            tabBarIcon: ({ color }) => <Wallet color={color} size={24} />,
            tabBarLabel: 'Assets'
          }}
        />
        <Tab.Screen 
          name="Swap" 
          component={MarketScreen} 
          options={{
            tabBarIcon: ({ color }) => <ArrowRightLeft color={color} size={24} />,
            tabBarLabel: 'Trade'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
