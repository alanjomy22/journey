import { SwipeableCameraScreen } from '@/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';


export default function NewPostScreen() {
  return (
    <View style={styles.container}>
      <SwipeableCameraScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
