import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { businessInfo, heroAssets, eventPackages } from '../config/assetsConfig';
import { useScrollZoom } from '../hooks/useScrollZoom';
import { GoldButton } from '../components/GoldButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.55;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { scrollHandler, headerAnimatedStyle, overlayAnimatedStyle, titleAnimatedStyle } =
    useScrollZoom(HEADER_HEIGHT);

  const handleCall = () => {
    Linking.openURL(`tel:${businessInfo.phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Animated Header Background */}
      <View style={[styles.headerContainer, { height: HEADER_HEIGHT }]}>
        <Animated.View style={[styles.headerMedia, headerAnimatedStyle]}>
          <Video
            source={{ uri: heroAssets.videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
          />
        </Animated.View>

        {/* Gradient Overlay */}
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]} />

        {/* Title Overlay */}
        <Animated.View style={[styles.titleOverlay, titleAnimatedStyle, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.brandName}>{businessInfo.name}</Text>
          <Text style={styles.tagline}>{businessInfo.tagline}</Text>
          <View style={styles.ctaRow}>
            <GoldButton title="Book Now" onPress={() => navigation.navigate('RentalTab' as never)} size="md" />
            <GoldButton title="Call Us" onPress={handleCall} variant="outline" size="md" />
          </View>
        </Animated.View>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'camera' as const, label: 'Rent Gear', screen: 'RentalTab' },
              { icon: 'image' as const, label: 'Portfolio', screen: 'PortfolioTab' },
              { icon: 'book-open' as const, label: 'Academy', screen: 'AcademyTab' },
              { icon: 'user' as const, label: 'About', screen: 'About' },
            ].map((action, i) => (
              <TouchableOpacity
                key={i}
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(action.screen as never)}
              >
                <View style={styles.actionIconContainer}>
                  <Feather name={action.icon} size={22} color="#D4AF37" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Packages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Packages</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {eventPackages.slice(0, 4).map((pkg) => (
              <View key={pkg.id} style={styles.packageCard}>
                <Image
                  source={{ uri: pkg.image }}
                  style={styles.packageImage}
                  contentFit="cover"
                  transition={300}
                />
                <View style={styles.packageInfo}>
                  <Text style={styles.packageTitle} numberOfLines={1}>{pkg.title}</Text>
                  <Text style={styles.packagePrice}>₹{pkg.startingPrice.toLocaleString()}+</Text>
                  <Text style={styles.packageDuration}>{pkg.duration}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Contact Strip */}
        <TouchableOpacity style={styles.contactStrip} onPress={handleCall} activeOpacity={0.8}>
          <Feather name="phone-call" size={20} color="#D4AF37" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.contactLabel}>Ready to book?</Text>
            <Text style={styles.contactPhone}>+91 {businessInfo.phone}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#666" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
  headerMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0A',
  },
  titleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#D4AF37',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#C0C0C0',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 300,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  quickActions: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F5',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,175,55,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    color: '#A0A0A0',
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
  },
  packageCard: {
    width: SCREEN_WIDTH * 0.6,
    marginRight: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  packageImage: {
    width: '100%',
    height: 140,
  },
  packageInfo: {
    padding: 12,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F5F5',
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
    marginTop: 4,
  },
  packageDuration: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  contactStrip: {
    marginTop: 32,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  contactLabel: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  contactPhone: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F5F5',
    marginTop: 2,
  },
});
