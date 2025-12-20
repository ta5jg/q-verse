import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MarketScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DEX & Swap Coming Soon</Text>
      <Text style={styles.subtext}>Mobile trading interface is under construction.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  text: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtext: { color: '#6b7280', marginTop: 10 }
});
