import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export default function WalletScreen() {
  const assets = [
    { symbol: 'QVR', name: 'Q-Verse', amount: '12,450.00', value: '$5,602.50', color: '#3b82f6' },
    { symbol: 'USDT', name: 'Tether', amount: '1,200.00', value: '$1,200.00', color: '#22c55e' },
    { symbol: 'POPEO', name: 'Popeo Stable', amount: '500.00', value: '$500.00', color: '#a855f7' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Assets</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2563eb' }]}>
            <Text style={styles.btnText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#1f2937' }]}>
            <Text style={styles.btnText}>Receive</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={assets}
        keyExtractor={item => item.symbol}
        renderItem={({ item }) => (
            <View style={styles.assetItem}>
                <View style={[styles.icon, { backgroundColor: item.color }]}>
                    <Text style={styles.iconText}>{item.symbol[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={styles.name}>{item.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.value}>{item.value}</Text>
                    <Text style={styles.amount}>{item.amount}</Text>
                </View>
            </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  actions: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, marginBottom: 30 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  list: { paddingHorizontal: 20 },
  assetItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  iconText: { color: 'white', fontWeight: 'bold' },
  symbol: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  name: { color: '#9ca3af', fontSize: 12 },
  value: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  amount: { color: '#9ca3af', fontSize: 12 }
});
