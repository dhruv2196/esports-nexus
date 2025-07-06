import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { config } from '@constants/config';

interface AuthContextType {
  isBiometricSupported: boolean;
  isBiometricEnabled: boolean;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    checkBiometricEnabled();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);
  };

  const checkBiometricEnabled = async () => {
    const enabled = await AsyncStorage.getItem(config.storage.keys.biometricEnabled);
    setIsBiometricEnabled(enabled === 'true');
  };

  const enableBiometric = async () => {
    if (!isBiometricSupported) {
      throw new Error('Biometric authentication is not supported on this device');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Enable biometric authentication',
      fallbackLabel: 'Cancel',
    });

    if (result.success) {
      await AsyncStorage.setItem(config.storage.keys.biometricEnabled, 'true');
      setIsBiometricEnabled(true);
    } else {
      throw new Error('Biometric authentication failed');
    }
  };

  const disableBiometric = async () => {
    await AsyncStorage.setItem(config.storage.keys.biometricEnabled, 'false');
    setIsBiometricEnabled(false);
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!isBiometricSupported || !isBiometricEnabled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
    });

    return result.success;
  };

  const value: AuthContextType = {
    isBiometricSupported,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};