import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector, useAppDispatch } from '@store/index';
import { checkAuthStatus } from '@store/slices/authSlice';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingScreen } from '@screens/Onboarding/OnboardingScreen';
import { SplashScreen } from '@screens/SplashScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if onboarding has been completed
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding_completed');
        setShowOnboarding(!onboardingCompleted);

        // Check authentication status
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {showOnboarding && !isAuthenticated ? (
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            animation: 'fade',
          }}
        />
      ) : null}
      
      {isAuthenticated ? (
        <Stack.Screen 
          name="Main" 
          component={MainNavigator}
          options={{
            animation: 'fade',
          }}
        />
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animation: 'fade',
          }}
        />
      )}
    </Stack.Navigator>
  );
};