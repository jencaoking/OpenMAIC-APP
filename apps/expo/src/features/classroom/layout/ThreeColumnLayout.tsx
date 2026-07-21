import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { CollapsiblePanel } from './CollapsiblePanel';
import { useClassroomStore } from '../store/classroomStore';

interface ThreeColumnLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  chat: React.ReactNode;
}

const SIDEBAR_MIN = 160;
const SIDEBAR_MAX = 320;
const CHAT_MIN = 280;
const CHAT_MAX = 480;

export function ThreeColumnLayout({ sidebar, main, chat }: ThreeColumnLayoutProps) {
  const { width: screenWidth } = useWindowDimensions();
  const {
    sidebarCollapsed,
    chatAreaCollapsed,
    sidebarWidth,
    chatAreaWidth,
    toggleSidebar,
    toggleChatArea,
    setSidebarWidth,
    setChatAreaWidth,
  } = useClassroomStore();

  // Auto-collapse panels on narrow screens
  const effectiveSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth;
  const effectiveChatWidth = chatAreaCollapsed ? 0 : chatAreaWidth;
  const mainWidth = screenWidth - effectiveSidebarWidth - effectiveChatWidth;

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <CollapsiblePanel
        width={sidebarWidth}
        collapsed={sidebarCollapsed}
        minWidth={SIDEBAR_MIN}
        maxWidth={SIDEBAR_MAX}
        onWidthChange={setSidebarWidth}
        onCollapseChange={toggleSidebar}
        side="left"
      >
        {sidebar}
      </CollapsiblePanel>

      {/* Main Content */}
      <View style={[styles.main, { width: mainWidth }]}>{main}</View>

      {/* Right Chat Area */}
      <CollapsiblePanel
        width={chatAreaWidth}
        collapsed={chatAreaCollapsed}
        minWidth={CHAT_MIN}
        maxWidth={CHAT_MAX}
        onWidthChange={setChatAreaWidth}
        onCollapseChange={toggleChatArea}
        side="right"
      >
        {chat}
      </CollapsiblePanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
  },
});
