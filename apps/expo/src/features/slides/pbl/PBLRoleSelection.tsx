import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { PBLProjectInfo, PBLAgent } from './pblTypes';
import { getSelectableAgents } from './pblTypes';

interface PBLRoleSelectionProps {
  projectInfo: PBLProjectInfo;
  agents: PBLAgent[];
  onSelectRole: (agentName: string) => void;
}

/**
 * PBL Role Selection screen.
 *
 * Port of Web's PBLRoleSelection component.
 * Shows project info and allows user to select a role.
 */
export function PBLRoleSelection({ projectInfo, agents, onSelectRole }: PBLRoleSelectionProps) {
  const selectableAgents = getSelectableAgents(agents);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Project Info */}
      <View style={styles.header}>
        <Text style={styles.title}>{projectInfo.title}</Text>
        <Text style={styles.description}>{projectInfo.description}</Text>
      </View>

      {/* Role Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>选择你的角色</Text>
        <Text style={styles.sectionSubtitle}>选择一个开发角色参与项目</Text>

        <View style={styles.agentGrid}>
          {selectableAgents.map((agent) => (
            <TouchableOpacity
              key={agent.name}
              style={styles.agentCard}
              onPress={() => onSelectRole(agent.name)}
              activeOpacity={0.7}
            >
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>{agent.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.agentName}>{agent.name}</Text>
              {agent.actor_role ? (
                <Text style={styles.agentRole} numberOfLines={2}>
                  {agent.actor_role}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* How it works */}
      <View style={styles.guideSection}>
        <Text style={styles.guideTitle}>如何参与</Text>
        <View style={styles.guideSteps}>
          <View style={styles.guideStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>选择一个角色加入项目团队</Text>
          </View>
          <View style={styles.guideStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>在看板中查看任务分配</Text>
          </View>
          <View style={styles.guideStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>与 AI Agent 协作完成任务</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  section: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  agentCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
    alignItems: 'flex-start',
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  agentAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  agentRole: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  guideSection: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  guideSteps: {
    gap: 12,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});
