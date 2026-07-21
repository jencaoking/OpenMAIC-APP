import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { PBLIssueboard, PBLIssue } from './pblTypes';
import { calculateProgress } from './pblTypes';

interface PBLIssueboardProps {
  issueboard: PBLIssueboard;
}

/**
 * PBL Issueboard panel.
 *
 * Port of Web's IssueboardPanel component.
 * Shows issue list with progress bar.
 */
export function PBLIssueboard({ issueboard }: PBLIssueboardProps) {
  const sortedIssues = [...issueboard.issues].sort((a, b) => a.index - b.index);
  const progressPercent = calculateProgress(issueboard);
  const doneCount = sortedIssues.filter((i) => i.is_done).length;
  const totalCount = sortedIssues.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>任务看板</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {doneCount}/{totalCount}
          </Text>
        </View>
      </View>

      {/* Issue List */}
      <ScrollView style={styles.issueList} contentContainerStyle={styles.issueListContent}>
        {sortedIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
        {sortedIssues.length === 0 && (
          <Text style={styles.emptyText}>暂无任务</Text>
        )}
      </ScrollView>
    </View>
  );
}

function IssueCard({ issue }: { issue: PBLIssue }) {
  const statusColor = issue.is_done
    ? '#10b981'
    : issue.is_active
      ? '#7c3aed'
      : '#9ca3af';

  const statusBg = issue.is_done
    ? '#ecfdf5'
    : issue.is_active
      ? '#f5f3ff'
      : '#f9fafb';

  const statusLabel = issue.is_done
    ? '已完成'
    : issue.is_active
      ? '进行中'
      : '待开始';

  return (
    <View style={[styles.issueCard, { borderColor: statusColor + '80', backgroundColor: statusBg }]}>
      <View style={styles.issueHeader}>
        <Text style={styles.issueTitle} numberOfLines={1}>{issue.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.issueDescription} numberOfLines={2}>
        {issue.description}
      </Text>
      <View style={styles.issueFooter}>
        <Text style={styles.issueAssignee}>负责人: {issue.person_in_charge || '未分配'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  issueList: {
    flex: 1,
  },
  issueListContent: {
    padding: 12,
    gap: 8,
  },
  issueCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  issueDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  issueAssignee: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 32,
  },
});
