export const theme = {
  colors: {
    // Primary - Changed to SoundMoney Orange
    primary: '#FF8C00', // SoundMoney Orange
    secondary: '#191414', // Dark background
    accent: '#FFA500', // Bright Orange

    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9F9F9',
      100: '#F3F3F3',
      200: '#E8E8E8',
      300: '#D0D0D0',
      400: '#B0B0B0',
      500: '#808080',
      600: '#505050',
      700: '#383838',
      800: '#282828',
      900: '#191414',
    },

    // Status
    success: '#FF8C00', // Changed to orange
    warning: '#FFB81C',
    danger: '#E22134',
    info: '#FFA500', // Changed to orange

    // Text
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      tertiary: '#808080',
    },

    // Background
    background: {
      primary: '#121212',
      secondary: '#191414',
      tertiary: '#282828',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell"',
      mono: '"SFMono-Regular", "Monaco", "Inconsolata", "Roboto Mono"',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
};

export type Theme = typeof theme;
