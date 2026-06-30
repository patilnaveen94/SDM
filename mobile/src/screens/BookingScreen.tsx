import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { rentalCatalog, RentalGear } from '../config/assetsConfig';
import { SectionHeader } from '../components/SectionHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

interface CartItem {
  gear: RentalGear;
  days: number;
}

export const BookingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'camera', 'lens', 'anamorphic', 'drone', 'lighting'];

  const filteredGear = selectedCategory === 'all'
    ? rentalCatalog
    : rentalCatalog.filter((g) => g.category === selectedCategory);

  const addToCart = (gear: RentalGear) => {
    if (cart.find((item) => item.gear.id === gear.id)) {
      Alert.alert('Already in Cart', `${gear.name} is already in your rental cart.`);
      return;
    }
    setCart((prev) => [...prev, { gear, days: 1 }]);
  };

  const removeFromCart = (gearId: string) => {
    setCart((prev) => prev.filter((item) => item.gear.id !== gearId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.gear.dailyRate * item.days, 0);

  const renderGearCard = useCallback(({ item }: { item: RentalGear }) => {
    const isInCart = cart.some((c) => c.gear.id === item.id);

    return (
      <View style={styles.gearCard}>
        <Image
          source={{ uri: item.image }}
          style={styles.gearImage}
          contentFit="cover"
          transition={200}
        />
        {!item.available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
        <View style={styles.gearInfo}>
          <Text style={styles.gearBrand}>{item.brand}</Text>
          <Text style={styles.gearName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.specRow}>
            {item.specs.slice(0, 2).map((spec, i) => (
              <Text key={i} style={styles.specText}>{spec}</Text>
            ))}
          </View>
          <View style={styles.gearFooter}>
            <View>
              <Text style={styles.gearPrice}>₹{item.dailyRate.toLocaleString()}</Text>
              <Text style={styles.gearPriceUnit}>/day</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.cartButton,
                isInCart && styles.cartButtonActive,
                !item.available && styles.cartButtonDisabled,
              ]}
              onPress={() => isInCart ? removeFromCart(item.id) : addToCart(item)}
              disabled={!item.available}
              activeOpacity={0.7}
            >
              <Feather
                name={isInCart ? 'check' : 'plus'}
                size={16}
                color={isInCart ? '#0A0A0A' : '#D4AF37'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [cart]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SectionHeader
        title="Gear Rental"
        goldWord="Rental"
        subtitle="Premium cinema equipment at daily rates"
      />

      {/* Category Filter */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 12 }}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.categoryChipActive,
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item && styles.categoryTextActive,
            ]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartLeft}>
            <Feather name="shopping-cart" size={16} color="#D4AF37" />
            <Text style={styles.cartCount}>{cart.length} items</Text>
          </View>
          <Text style={styles.cartTotal}>₹{cartTotal.toLocaleString()}/day</Text>
        </View>
      )}

      {/* Gear Grid */}
      <FlatList
        data={filteredGear}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderGearCard}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A0A0',
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: '#0A0A0A',
  },
  cartSummary: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
  },
  cartTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F5F5F5',
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  gearCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  gearImage: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
  },
  gearInfo: {
    padding: 10,
  },
  gearBrand: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gearName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F5F5F5',
    marginTop: 3,
    lineHeight: 16,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  specText: {
    fontSize: 9,
    color: '#666',
    backgroundColor: '#111',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gearFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  gearPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
  },
  gearPriceUnit: {
    fontSize: 9,
    color: '#666',
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  cartButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  cartButtonDisabled: {
    backgroundColor: '#222',
    borderColor: '#333',
    opacity: 0.5,
  },
});
