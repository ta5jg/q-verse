import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Zap, TrendingUp } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#0a0a0f']}
        style={styles.header}
      >
        <Text style={styles.appName}>Q-Verse Mobile</Text>
        <Text style={styles.tagline}>Quantum-Safe Hybrid Finance</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Mainnet Online (124ms)</Text>
          </View>
          <Text style={styles.balanceLabel}>Total Ecosystem TVL</Text>
          <Text style={styles.balanceValue}>$450,240,102</Text>
        </View>

        {/* Features Grid */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.featureBox}>
            <Shield color="#4ade80" size={32} />
            <Text style={styles.featureTitle}>Quantum Safe</Text>
            <Text style={styles.featureDesc}>Dilithium5 Keys</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureBox}>
            <Zap color="#fbbf24" size={32} />
            <Text style={styles.featureTitle}>Instant Tx</Text>
            <Text style={styles.featureDesc}>&lt;1s Finality</Text>
          </TouchableOpacity>
        </View>

        {/* AI Insight */}
        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.aiCard}>
            <View style={styles.row}>
                <TrendingUp color="#60a5fa" size={20} />
                <Text style={styles.aiTitle}>Q-Mind AI Insight</Text>
            </View>
            <Text style={styles.aiText}>
                "Market volatility is low. Staking QVR now offers optimal risk-adjusted returns (5.2% APY)."
            </Text>
        </LinearGradient>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  appName: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  tagline: { color: '#94a3b8', fontSize: 14 },
  content: { padding: 20 },
  card: { backgroundColor: '#111827', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1f2937' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  statusText: { color: '#4ade80', fontSize: 12, fontWeight: 'bold' },
  balanceLabel: { color: '#9ca3af', fontSize: 14 },
  balanceValue: { color: 'white', fontSize: 32, fontWeight: 'bold', fontFamily: 'Courier New' }, // Courier New usually works, or Platform.select
  grid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  featureBox: { flex: 1, backgroundColor: '#1f2937', padding: 20, borderRadius: 16, alignItems: 'center' },
  featureTitle: { color: 'white', fontWeight: 'bold', marginTop: 10 },
  featureDesc: { color: '#9ca3af', fontSize: 12 },
  aiCard: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#3b82f633' },
  aiTitle: { color: '#60a5fa', fontWeight: 'bold' },
  aiText: { color: '#e2e8f0', marginTop: 8, fontStyle: 'italic' }
});
