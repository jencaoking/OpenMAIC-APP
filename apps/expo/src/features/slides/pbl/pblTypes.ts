/**
 * PBL (Project-Based Learning) Types for Mobile.
 *
 * Port of Web's lib/pbl/types.ts.
 */

export type PBLMode = 'project_info' | 'agent' | 'issueboard' | 'idle';

export interface PBLProjectInfo {
  title: string;
  description: string;
}

export type PBLRoleDivision = 'management' | 'development';

export interface PBLAgent {
  name: string;
  actor_role: string;
  role_division: PBLRoleDivision;
  system_prompt: string;
  default_mode: string;
  delay_time: number;
  env: Record<string, unknown>;
  is_user_role: boolean;
  is_active: boolean;
  is_system_agent: boolean;
}

export interface PBLIssue {
  id: string;
  title: string;
  description: string;
  person_in_charge: string;
  participants: string[];
  notes: string;
  parent_issue: string | null;
  index: number;
  is_done: boolean;
  is_active: boolean;
  generated_questions: string;
  question_agent_name: string;
  judge_agent_name: string;
}

export interface PBLIssueboard {
  agent_ids: string[];
  issues: PBLIssue[];
  current_issue_id: string | null;
}

export interface PBLChatMessage {
  id: string;
  agent_name: string;
  message: string;
  timestamp: number;
  read_by: string[];
}

export interface PBLChat {
  messages: PBLChatMessage[];
}

export interface PBLProjectConfig {
  projectInfo: PBLProjectInfo;
  agents: PBLAgent[];
  issueboard: PBLIssueboard;
  chat: PBLChat;
  selectedRole?: string | null;
}

/**
 * Interactive content type for scene rendering
 */
export interface PBLContent {
  type: 'pbl';
  projectConfig: PBLProjectConfig;
}

/**
 * Get the active issue from the issueboard
 */
export function getActiveIssue(issueboard: PBLIssueboard): PBLIssue | null {
  return issueboard.issues.find((i) => i.is_active) || null;
}

/**
 * Get the current issue by ID
 */
export function getCurrentIssue(issueboard: PBLIssueboard): PBLIssue | null {
  if (!issueboard.current_issue_id) return null;
  return issueboard.issues.find((i) => i.id === issueboard.current_issue_id) || null;
}

/**
 * Get selectable agents (non-system, development roles)
 */
export function getSelectableAgents(agents: PBLAgent[]): PBLAgent[] {
  return agents.filter((a) => !a.is_system_agent && a.role_division === 'development');
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(issueboard: PBLIssueboard): number {
  const total = issueboard.issues.length;
  if (total === 0) return 0;
  const done = issueboard.issues.filter((i) => i.is_done).length;
  return Math.round((done / total) * 100);
}
