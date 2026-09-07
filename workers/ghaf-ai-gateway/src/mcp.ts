import { McpServer, createMcpHandler, type McpHttpHandler } from '@modelcontextprotocol/server';

import {
  childCoachTextRequestV1Schema,
  childCoachTextResponseV1Schema,
  parentTaskDraftRequestV1Schema,
  parentTaskDraftSuggestionV1Schema,
  type ChildCoachTextRequestV1,
  type ChildCoachTextResponseV1,
  type ParentTaskDraftRequestV1,
  type ParentTaskDraftSuggestionV1,
} from '../../../src/models/boundedAi';
import type { GatewayErrorCode } from './security';

export const GHAF_MCP_PROTOCOL_VERSION = '2026-07-28' as const;

export const GHAF_MCP_TOOL_OPERATIONS = Object.freeze({
  draft_parent_task: 'draft_parent_task_v1',
  coach_current_task: 'coach_approved_task_v1',
} as const);

export type GhafMcpOperation =
  (typeof GHAF_MCP_TOOL_OPERATIONS)[keyof typeof GHAF_MCP_TOOL_OPERATIONS];

type McpOperationResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly code: GatewayErrorCode };

export interface GhafMcpOperations {
  readonly authorizedOperation: GhafMcpOperation | null;
  readonly executeParentTaskDraft: (
    request: ParentTaskDraftRequestV1,
  ) => Promise<McpOperationResult<ParentTaskDraftSuggestionV1>>;
  readonly executeChildCoach: (
    request: ChildCoachTextRequestV1,
  ) => Promise<McpOperationResult<ChildCoachTextResponseV1>>;
}

const readOnlyAnnotations = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

function safeToolFailure(code: GatewayErrorCode) {
  return {
    content: [{ type: 'text' as const, text: code }],
    isError: true as const,
  };
}

export function createGhafMcpHandler(operations: GhafMcpOperations): McpHttpHandler {
  return createMcpHandler(
    () => {
      const server = new McpServer({ name: 'ghaf-bounded-ai', version: '1.0.0' });

      server.registerTool(
        'draft_parent_task',
        {
          title: 'Draft a bounded Parent task',
          description:
            'Propose reviewed bilingual wording while deterministic Ghaf authorities remain unchanged.',
          inputSchema: parentTaskDraftRequestV1Schema,
          outputSchema: parentTaskDraftSuggestionV1Schema,
          annotations: readOnlyAnnotations,
        },
        async (request) => {
          if (operations.authorizedOperation !== 'draft_parent_task_v1') {
            return safeToolFailure('FORBIDDEN');
          }
          const result = await operations.executeParentTaskDraft(request);
          if (!result.ok) return safeToolFailure(result.code);
          return {
            content: [{ type: 'text', text: 'Bounded Parent task draft ready.' }],
            structuredContent: result.data,
          };
        },
      );

      server.registerTool(
        'coach_current_task',
        {
          title: 'Coach the current approved task',
          description:
            'Return one terminal age-bounded coaching card for the current reviewed task context.',
          inputSchema: childCoachTextRequestV1Schema,
          outputSchema: childCoachTextResponseV1Schema,
          annotations: readOnlyAnnotations,
        },
        async (request) => {
          if (operations.authorizedOperation !== 'coach_approved_task_v1') {
            return safeToolFailure('FORBIDDEN');
          }
          const result = await operations.executeChildCoach(request);
          if (!result.ok) return safeToolFailure(result.code);
          return {
            content: [{ type: 'text', text: 'Bounded Child Coach card ready.' }],
            structuredContent: result.data,
          };
        },
      );

      return server;
    },
    { legacy: 'reject' },
  );
}
