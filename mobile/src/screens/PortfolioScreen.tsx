import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { portfolioItems, PortfolioCategory, PortfolioItem } from '../config/assetsConfig';
import { SectionHeader } from '../components/SectionHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 4;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * 3) / 2;

const filters: { label: string; value: PortfolioCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Weddings', value: 'wedding' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Gear', value: 'rental_gear' },
  { label: 'Videos', value: 'videos' },
];

export const PortfolioScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory>('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const filteredItems = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === activeFilter);

  const renderItem = useCallback(({ item }: { item: PortfolioItem }) => (
    <TouchableOpacity
      style={styles.gridItem}
      activeOpacity={0.8}
      onPress={() => setSelectedItem(item)}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.gridImage}
        contentFit="cover"
        transition={200}
        recyclingKey={item.id}
      />
      {item.type === 'video' && (
        <View style={styles.playBadge}>
          <Feather name="play" size={14} color="#0A0A0A" />
        </View>
      )}
      <View style={styles.itemOverlay}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SectionHeader title="Our Portfolio" goldWord="Portfolio" subtitle="Curated gallery of our finest work" />

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          keyExtractor={(item) => item.value}
          renderItem={({ item: filter }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(filter.value)}
              style={[
                styles.filterChip,
                activeFilter === filter.value && styles.filterChipActive,
              ]}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter.value && styles.filterTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Grid */}
      <FlatList
        data={filteredItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: GRID_GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
      />

      {/* Lightbox Modal */}
      <Modal visible={!!selectedItem} animationType="fade" transparent>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedItem(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedItem?.type === 'video' ? (
              <Video
                source={{ uri: selectedItem.fullUrl }}
                style={styles.modalMedia}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                useNativeControls
              />
            ) : (
              <Image
                source={{ uri: selectedItem?.fullUrl }}
                style={styles.modalMedia}
                contentFit="contain"
              />
            )}
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
              <Text style={styles.modalDesc}>{selectedItem?.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <Feather name="x" size={22} color="#FFF" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  filterChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0A0A0',
  },
  filterTextActive: {
    color: '#0A0A0A',
  },
  gridContainer: {
    paddingHorizontal: GRID_GAP,
    paddingBottom: 100,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(10,10,10,0.8)',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F5F5F5',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.92,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  modalMedia: {
    width: '100%',
    height: SCREEN_WIDTH * 0.7,
  },
  modalInfo: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F5',
  },
  modalDesc: {
    fontSize: 13,
    color: '#A0A0A0',
    marginTop: 4,
    lineHeight: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30,30,30,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
