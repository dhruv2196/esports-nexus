import { DefaultTheme } from 'react-native-paper';

export const colors = {
  // Primary colors
  primary: '#0f3460',
  primaryDark: '#0a2342',
  primaryLight: '#1e4d8b',
  
  // Secondary colors
  secondary: '#e94560',
  secondaryDark: '#c13651',
  secondaryLight: '#ff6b6b',
  
  // Accent colors
  accent: '#16213e',
  accentLight: '#1a1a2e',
  
  // Background colors
  background: '#f5f5f5',
  backgroundDark: '#1a1a2e',
  surface: '#ffffff',
  surfaceDark: '#16213e',
  
  // Text colors
  text: '#333333',
  textDark: '#ffffff',
  textSecondary: '#666666',
  textSecondaryDark: '#b0b0b0',
  
  // Status colors
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  
  // Game-specific colors
  valorant: '#ff4655',
  bgmi: '#f2a900',
  codm: '#00a8e8',
  freefire: '#ff6b00',
  
  // Rank colors
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
  diamond: '#b9f2ff',
  immortal: '#ff1744',
  radiant: '#fffbf0',
  
  // Other colors
  border: '#e0e0e0',
  borderDark: '#333333',
  disabled: '#9e9e9e',
  placeholder: '#999999',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    textTransform: 'uppercase' as const,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.30,
    shadowRadius: 5.46,
    elevation: 8,
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: colors.overlay,
    notification: colors.secondary,
  },
  roundness: borderRadius.md,
};

export const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primaryLight,
    accent: colors.accent,
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    error: colors.error,
    text: colors.textDark,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: colors.overlay,
    notification: colors.secondary,
  },
  roundness: borderRadius.md,
};