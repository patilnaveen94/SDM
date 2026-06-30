import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  goldWord?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, goldWord }) => {
  const parts = goldWord ? title.split(goldWord) : [title];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {goldWord ? (
          <>
            {parts[0]}
            <Text style={styles.goldText}>{goldWord}</Text>
            {parts[1] || ''}
          </>
        ) : (
          title
        )}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F5F5F5',
    letterSpacing: -0.5,
  },
  goldText: {
    color: '#D4AF37',
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 6,
    lineHeight: 20,
  },
});
