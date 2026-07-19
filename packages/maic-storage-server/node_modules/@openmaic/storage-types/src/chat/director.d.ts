/**
 * Summary of an agent's turn in the conversation.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface AgentTurnSummary {
    agentId: string;
    turnNumber: number;
    summary: string;
}
/**
 * Record of a whiteboard action for the director ledger.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface WhiteboardActionRecord {
    actionId: string;
    sceneId?: string;
    actionIndex?: number;
    timestamp: string;
    data: Record<string, unknown>;
}
/**
 * Accumulated director state passed between per-agent requests.
 * Client-maintained — backend is stateless.
 * @remarks This is a pure type contract. Zero runtime dependencies. Safe for Expo/Metro bundler.
 */
export interface DirectorState {
    turnCount: number;
    agentResponses: AgentTurnSummary[];
    whiteboardLedger: WhiteboardActionRecord[];
}
//# sourceMappingURL=director.d.ts.map