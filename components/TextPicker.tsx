import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FontFamily {
  name: string;
  fontFamily: string;
  category: string;
}

interface TextPickerProps {
  visible: boolean;
  onClose: () => void;
  onTextAdd: (text: string, fontFamily: string, fontSize: number, color: string) => void;
  initialText?: string;
  initialFontSize?: number;
  initialColor?: string;
  initialFontFamily?: string;
}

const fontCategories = [
  { name: 'Modern', fonts: ['System', 'Helvetica', 'Arial'] },
  { name: 'Classic', fonts: ['Times New Roman', 'Georgia', 'Serif'] },
  { name: 'Signature', fonts: ['Brush Script', 'Script', 'Cursive'] },
  { name: 'Editor', fonts: ['Courier', 'Monaco', 'Monospace'] },
  { name: 'Poster', fonts: ['Impact', 'Arial Black', 'Bold'] },
];

const colors = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#008000',
];

export const TextPicker: React.FC<TextPickerProps> = ({
  visible,
  onClose,
  onTextAdd,
  initialText = 'Tap to edit',
  initialFontSize = 24,
  initialColor = '#FFFFFF',
  initialFontFamily = 'System',
}) => {
  const [text, setText] = useState(initialText);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [color, setColor] = useState(initialColor);
  const [selectedCategory, setSelectedCategory] = useState('Modern');
  const [selectedFont, setSelectedFont] = useState(initialFontFamily);
  const [showFontPicker, setShowFontPicker] = useState(false);

  const handleDone = useCallback(() => {
    onTextAdd(text, selectedFont, fontSize, color);
    onClose();
  }, [text, selectedFont, fontSize, color, onTextAdd, onClose]);

  const handleFontSelect = useCallback((font: string) => {
    setSelectedFont(font);
    setShowFontPicker(false);
  }, []);

  const getCurrentCategoryFonts = () => {
    const category = fontCategories.find(cat => cat.name === selectedCategory);
    return category ? category.fonts : fontCategories[0].fonts;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Text</Text>
          <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Text Preview Area */}
        <View style={styles.previewContainer}>
          {/* Font Size Slider */}
          <View style={styles.sizeSliderContainer}>
            <View style={styles.sizeSlider}>
              <Slider
                style={styles.slider}
                minimumValue={12}
                maximumValue={72}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
                vertical={true}
                step={1}
              />
              <View style={styles.sizeLabelContainer}>
                <Text style={styles.sizeLabel}>{Math.round(fontSize)}</Text>
              </View>
            </View>
          </View>

          {/* Text Preview - Editable */}
          <View style={styles.textPreview}>
            <TextInput
              style={[
                styles.previewText,
                {
                  fontSize: fontSize,
                  color: color,
                  fontFamily: selectedFont === 'System' ? undefined : selectedFont,
                },
              ]}
              value={text}
              onChangeText={setText}
              placeholder="Your text here"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              textAlign="center"
              autoFocus
              maxLength={100}
            />
          </View>
        </View>

        {/* Font Category Selection */}
        <View style={styles.fontCategoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {fontCategories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.name && styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Font Selection and Tools */}
        <View style={styles.toolsContainer}>
          <View style={styles.toolsRow}>
            {/* Font Family Button */}
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => setShowFontPicker(!showFontPicker)}
            >
              <Text style={styles.toolButtonText}>Aa</Text>
            </TouchableOpacity>

            {/* Color Picker */}
            <View style={styles.colorPickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {colors.map((colorOption) => (
                  <TouchableOpacity
                    key={colorOption}
                    style={[
                      styles.colorOption,
                      { backgroundColor: colorOption },
                      color === colorOption && styles.selectedColor,
                    ]}
                    onPress={() => setColor(colorOption)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Alignment Button */}
            <TouchableOpacity style={styles.toolButton}>
              <Ionicons name="text" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Effects Button */}
            <TouchableOpacity style={styles.toolButton}>
              <Text style={styles.toolButtonText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Font Picker Modal */}
        {showFontPicker && (
          <View style={styles.fontPickerOverlay}>
            <View style={styles.fontPickerContainer}>
              <Text style={styles.fontPickerTitle}>Select Font</Text>
              <ScrollView style={styles.fontList}>
                {getCurrentCategoryFonts().map((font) => (
                  <TouchableOpacity
                    key={font}
                    style={[
                      styles.fontOption,
                      selectedFont === font && styles.selectedFontOption,
                    ]}
                    onPress={() => handleFontSelect(font)}
                  >
                    <Text
                      style={[
                        styles.fontOptionText,
                        { 
                          fontFamily: font === 'System' ? undefined : font,
                          fontWeight: font === 'Impact' || font === 'Arial Black' ? 'bold' : 'normal',
                        },
                        selectedFont === font && styles.selectedFontOptionText,
                      ]}
                    >
                      {font}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  doneButton: {
    padding: 8,
  },
  doneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    height: 250,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sizeSliderContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSlider: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    width: 30,
    height: 180,
  },
  sliderThumb: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  sliderTrack: {
    height: 3,
    borderRadius: 2,
  },
  sizeLabelContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sizeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  textPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginLeft: 15,
    padding: 20,
  },
  previewText: {
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    minHeight: 40,
    width: '100%',
  },
  fontCategoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCategoryButton: {
    backgroundColor: '#FFFFFF',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#000000',
  },
  toolsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  toolButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorPickerContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
  },
  fontPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontPickerContainer: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
  },
  fontPickerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  fontList: {
    maxHeight: 300,
  },
  fontOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedFontOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  fontOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedFontOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
