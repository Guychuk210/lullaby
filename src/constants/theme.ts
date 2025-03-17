import { colors } from './colors';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
  },
  padding: {
    header: 60,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System-Bold',
    },
    fontSize: {
      xs: 12,
      s: 14,
      m: 16,
      l: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      xs: 16,
      s: 20,
      m: 24,
      l: 28,
      xl: 32,
      xxl: 36,
      xxxl: 40,
    },
  },
  dimensions: {
    width,
    height,
  },
};

export type Theme = typeof theme;
