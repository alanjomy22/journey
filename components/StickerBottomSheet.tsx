import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StickerBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onStickerSelect: (stickerUri: string) => void;
}

// Sample sticker data - you can replace these with your own sticker images
const sampleStickers = [
  { id: '1', uri: 'https://cdn-icons-png.flaticon.com/512/742/742751.png', name: 'Heart' },
  { id: '2', uri: 'https://cdn-icons-png.flaticon.com/512/742/742752.png', name: 'Star' },
  { id: '3', uri: 'https://cdn-icons-png.flaticon.com/512/742/742753.png', name: 'Smile' },
  { id: '4', uri: 'https://cdn-icons-png.flaticon.com/512/742/742754.png', name: 'Fire' },
  { id: '5', uri: 'https://cdn-icons-png.flaticon.com/512/742/742755.png', name: 'Thumbs Up' },
  { id: '6', uri: 'https://cdn-icons-png.flaticon.com/512/742/742756.png', name: 'Party' },
  { id: '7', uri: 'https://cdn-icons-png.flaticon.com/512/742/742757.png', name: 'Love' },
  { id: '8', uri: 'https://cdn-icons-png.flaticon.com/512/742/742758.png', name: 'Cool' },
  { id: '9', uri: 'https://cdn-icons-png.flaticon.com/512/742/742759.png', name: 'Laugh' },
  { id: '10', uri: 'https://cdn-icons-png.flaticon.com/512/742/742760.png', name: 'Wink' },
  { id: '11', uri: 'https://cdn-icons-png.flaticon.com/512/742/742761.png', name: 'Kiss' },
  { id: '12', uri: 'https://cdn-icons-png.flaticon.com/512/742/742762.png', name: 'Angry' },
];

export const StickerBottomSheet: React.FC<StickerBottomSheetProps> = ({
  bottomSheetRef,
  onStickerSelect,
}) => {
  const handleStickerPress = (stickerUri: string) => {
    onStickerSelect(stickerUri);
    bottomSheetRef.current?.close();
  };

  const renderStickerItem = ({ item }: { item: typeof sampleStickers[0] }) => (
    <TouchableOpacity
      style={styles.stickerItem}
      onPress={() => handleStickerPress(item.uri)}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.stickerImage}
        contentFit="contain"
      />
      <Text style={styles.stickerName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%', '75%']}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose a Sticker</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={sampleStickers}
          renderItem={renderStickerItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.stickerGrid}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1a1a1a',
  },
  handleIndicator: {
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerGrid: {
    paddingBottom: 20,
  },
  stickerItem: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stickerImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  stickerName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
