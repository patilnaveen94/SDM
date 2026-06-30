import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { businessInfo } from '../config/assetsConfig';
import { GoldButton } from '../components/GoldButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45;

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
      [2, 1.2, 0.9],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
      [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.3],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.5, HEADER_HEIGHT],
      [1, 0.7, 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.5, HEADER_HEIGHT],
      [0.2, 0.5, 0.85],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.5],
      [0, -40],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.4],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const handleCall = () => {
    Linking.openURL(`tel:${businessInfo.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${businessInfo.email}`);
  };

  return (
    <View style={styles.container}>
      {/* Animated Header with Scroll-Zoom */}
      <View style={[styles.headerContainer, { height: HEADER_HEIGHT }]}>
        <Animated.View style={[styles.headerImage, imageAnimatedStyle]}>
          <Image
            source={{ uri: businessInfo.founder.profileImage }}
            style={styles.profileImage}
            contentFit="cover"
            transition={400}
          />
        </Animated.View>

        <Animated.View style={[styles.headerOverlay, overlayAnimatedStyle]} />

        <Animated.View style={[styles.headerTitle, titleAnimatedStyle]}>
          <Text style={styles.founderName}>{businessInfo.founder.name}</Text>
          <Text style={styles.founderTitle}>{businessInfo.founder.title}</Text>
        </Animated.View>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {/* Bio Section */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>
            Meet the <Text style={styles.goldText}>Visionary</Text>
          </Text>
          <View style={styles.divider} />
          <Text style={styles.bioText}>{businessInfo.founder.bio}</Text>
        </View>

        {/* Credentials */}
        <View style={styles.credentialsSection}>
          <Text style={styles.credentialsTitle}>Credentials & Achievements</Text>
          {businessInfo.founder.credentials.map((credential, index) => (
            <View key={index} style={styles.credentialItem}>
              <View style={styles.credentialIcon}>
                <Feather name="award" size={14} color="#D4AF37" />
              </View>
              <Text style={styles.credentialText}>{credential}</Text>
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <View style={styles.contactButtons}>
            <GoldButton title="Call Now" onPress={handleCall} size="md" />
            <GoldButton title="Email" onPress={handleEmail} variant="outline" size="md" />
          </View>

          {/* Social Links */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL(businessInfo.socials.instagram)}
            >
              <Feather name="instagram" size={20} color="#D4AF37" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL(businessInfo.socials.youtube)}
            >
              <Feather name="youtube" size={20} color="#D4AF37" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL(businessInfo.socials.linkedin)}
            >
              <Feather name="linkedin" size={20} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0A',
  },
  headerTitle: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  founderName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: -0.5,
  },
  founderTitle: {
    fontSize: 14,
    color: '#C0C0C0',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bioSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  goldText: {
    color: '#D4AF37',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    marginVertical: 16,
  },
  bioText: {
    fontSize: 15,
    color: '#C0C0C0',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  credentialsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  credentialsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F5',
    marginBottom: 16,
  },
  credentialItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  credentialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  credentialText: {
    flex: 1,
    fontSize: 13,
    color: '#C0C0C0',
    lineHeight: 19,
  },
  contactSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
