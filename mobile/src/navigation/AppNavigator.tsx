import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { AcademyScreen } from '../screens/AcademyScreen';
import { AboutScreen } from '../screens/AboutScreen';

// ─── Type Definitions ────────────────────────────────────────────────────────

export type RootTabParamList = {
  HomeTab: undefined;
  PortfolioTab: undefined;
  RentalTab: undefined;
  AcademyTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  About: undefined;
  GearDetail: { gearId: string };
  CourseDetail: { courseId: string };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Dark Theme ──────────────────────────────────────────────────────────────

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D4AF37',
    background: '#0A0A0A',
    card: '#111111',
    text: '#F5F5F5',
    border: '#2A2A2A',
    notification: '#D4AF37',
  },
};

// ─── Tab Navigator ───────────────────────────────────────────────────────────

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              break;
            case 'PortfolioTab':
              iconName = 'image';
              break;
            case 'RentalTab':
              iconName = 'camera';
              break;
            case 'AcademyTab':
              iconName = 'book-open';
              break;
          }

          return (
            <View style={{ alignItems: 'center' }}>
              {focused && (
                <View
                  style={{
                    position: 'absolute',
                    top: -8,
                    width: 24,
                    height: 3,
                    backgroundColor: '#D4AF37',
                    borderRadius: 2,
                  }}
                />
              )}
              <Feather name={iconName} size={size - 2} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="PortfolioTab" component={PortfolioScreen} options={{ tabBarLabel: 'Portfolio' }} />
      <Tab.Screen name="RentalTab" component={BookingScreen} options={{ tabBarLabel: 'Rental' }} />
      <Tab.Screen name="AcademyTab" component={AcademyScreen} options={{ tabBarLabel: 'Academy' }} />
    </Tab.Navigator>
  );
};

// ─── Root Stack ──────────────────────────────────────────────────────────────

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#0A0A0A' },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            headerShown: true,
            headerTitle: 'About the Founder',
            headerStyle: { backgroundColor: '#111111' },
            headerTintColor: '#D4AF37',
            headerTitleStyle: { fontWeight: '700' },
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
