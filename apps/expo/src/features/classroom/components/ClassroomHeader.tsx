import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useClassroomStore } from '../store/classroomStore';

interface ClassroomHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onPresent?: () => void;
}

export function ClassroomHeader({ title, subtitle, onBack, onPresent }: ClassroomHeaderProps) {
  const { toggleSidebar, toggleChatArea, sidebarCollapsed, chatAreaCollapsed } =
    useClassroomStore();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      {/* Title */}
      <View style={styles.titleBlock}>
        {subtitle && <Text style={styles.label}>{subtitle}</Text>}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.spacer} />

      {/* Presentation Mode */}
      {onPresent && (
        <Pressable style={styles.presentBtn} onPress={onPresent}>
          <Text style={styles.presentText}>⛶ 演示</Text>
        </Pressable>
      )}

      {/* Toggle Buttons */}
      <Pressable style={styles.toggleBtn} onPress={toggleSidebar}>
        <Text style={[styles.toggleText, !sidebarCollapsed && styles.toggleActive]}>☰</Text>
      </Pressable>

      <Pressable style={styles.toggleBtn} onPress={toggleChatArea}>
        <Text style={[styles.toggleText, !chatAreaCollapsed && styles.toggleActive]}>💬</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#94a3b8',
  },
  titleBlock: {
    marginLeft: 8,
    flex: 1,
  },
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.15,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  spacer: {
    flex: 1,
  },
  presentBtn: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  presentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  toggleText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  toggleActive: {
    color: '#7c3aed',
  },
});
