import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  style,
}) => {
  const isFilled = variant === 'filled';

  const sizeStyles: Record<string, { paddingV: number; paddingH: number; fontSize: number }> = {
    sm: { paddingV: 8, paddingH: 16, fontSize: 12 },
    md: { paddingV: 12, paddingH: 24, fontSize: 14 },
    lg: { paddingV: 16, paddingH: 32, fontSize: 16 },
  };

  const { paddingV, paddingH, fontSize } = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: isFilled ? '#D4AF37' : 'transparent',
          borderWidth: isFilled ? 0 : 2,
          borderColor: '#D4AF37',
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isFilled ? '#0A0A0A' : '#D4AF37',
            fontSize,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
