import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const candidateUrl = new URL('../../docs/content/MANGROVE_LEARNING_CANDIDATE.md', import.meta.url);

type Locale = 'ar' | 'en';

interface LocalizedCandidateMessage {
  readonly id: string;
  readonly ar: string;
  readonly en: string;
  readonly claimIds: readonly string[];
}

interface CandidateClaim {
  readonly id: string;
  readonly ar: string;
  readonly en: string;
  readonly sourceIds: readonly string[];
  readonly mutable: false;
}

interface CandidateSource {
  readonly id: string;
  readonly title: string;
  readonly authority: string;
  readonly language: Locale;
  readonly url: string;
  readonly accessedOn: '2026-09-05';
  readonly directAccess: 'opened';
  readonly supportsClaimIds: readonly string[];
  readonly humanReview: 'not_run';
}

interface CandidateRouteStep {
  readonly stepId: string;
  readonly messageIds: readonly string[];
  readonly claimIds: readonly string[];
}

interface CandidateRoute {
  readonly path: string;
  readonly objectiveId: string;
  readonly claimIds: readonly string[];
  readonly checkId: string;
  readonly steps: readonly CandidateRouteStep[];
}

interface CandidateReviewGate {
  readonly id: string;
  readonly status: 'not_run';
  readonly releaseEffect: 'blocks_release_activation';
}

interface MangroveLearningCandidate {
  readonly schemaVersion: 1;
  readonly status: 'candidate_evidence_not_human_approved';
  readonly package: {
    readonly id: string;
    readonly titleMessageId: string;
    readonly objectiveId: string;
    readonly objectiveMessageId: string;
    readonly completionCreditId: string;
    readonly unlockThreshold: 132;
    readonly routes: {
      readonly story: CandidateRoute;
      readonly accessible: CandidateRoute;
    };
  };
  readonly claims: readonly CandidateClaim[];
  readonly sources: readonly CandidateSource[];
  readonly messages: readonly LocalizedCandidateMessage[];
  readonly check: {
    readonly id: string;
    readonly objectiveId: string;
    readonly claimIds: readonly string[];
    readonly promptMessageId: string;
    readonly correctOptionId: 'habitat_support_and_care';
    readonly incorrectOptionId: 'visit_or_task_reward';
    readonly correctOptionMessageId: string;
    readonly incorrectOptionMessageId: string;
    readonly retryMessageId: string;
    readonly successMessageId: string;
    readonly noFail: true;
    readonly retryHasNoLoss: true;
  };
  readonly completionConsequences: {
    readonly seeds: 0;
    readonly gardenGrowth: 0;
    readonly canopy: 0;
    readonly greenCircle: 0;
    readonly privateLeague: 0;
    readonly challengeLeaf: 0;
    readonly familyReward: 0;
    readonly taskReward: 0;
  };
  readonly delivery: {
    readonly deterministicLocal: true;
    readonly offline: true;
    readonly finite: true;
    readonly autoplayNextLearning: false;
    readonly requiresNetwork: false;
    readonly opensExternalBrowser: false;
    readonly requiresGps: false;
    readonly requiresCamera: false;
    readonly requiresMicrophone: false;
    readonly requiresMedia: false;
  };
  readonly release: {
    readonly featureFlag: 'r002b_learning_ui';
    readonly defaultEnabled: false;
    readonly activation: 'blocked';
    readonly contentAuthority: 'candidate_only';
  };
  readonly reviewGates: readonly CandidateReviewGate[];
  readonly integration: {
    readonly messageIdsAreRecommendedResourceKeys: true;
    readonly singleRuntimeCopyAuthority: 'src/i18n/resources.ts';
    readonly deepFreezeAtAdapterBoundary: true;
    readonly runtimeRemoteContent: false;
  };
  readonly researchGaps: readonly {
    readonly sourceUrl: string;
    readonly status: 'not_used_timeout';
    readonly reliedOnByClaimIds: readonly [];
  }[];
}

function readCandidateDocument(): string {
  expect(existsSync(candidateUrl), 'candidate evidence document must exist').toBe(true);
  return readFileSync(candidateUrl, 'utf8');
}

function parseCandidate(): MangroveLearningCandidate {
  const document = readCandidateDocument();
  const match = document.match(
    /<!-- MANGROVE_LEARNING_CANDIDATE_JSON_START -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- MANGROVE_LEARNING_CANDIDATE_JSON_END -->/u,
  );
  expect(match, 'candidate document must contain one delimited JSON evidence block').not.toBeNull();
  return JSON.parse(match?.[1] ?? '{}') as MangroveLearningCandidate;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function routeClaimIds(route: CandidateRoute): string[] {
  return unique(route.steps.flatMap((step) => step.claimIds)).sort();
}

describe('R002b Mangrove learning candidate content evidence', () => {
  it('is visibly non-authoritative and preserves the approved package identity', () => {
    const document = readCandidateDocument();
    const candidate = parseCandidate();

    expect(document).toContain(
      'STATUS: CANDIDATE EVIDENCE — NOT HUMAN-APPROVED — NOT RELEASE AUTHORITY',
    );
    expect(candidate).toMatchObject({
      schemaVersion: 1,
      status: 'candidate_evidence_not_human_approved',
      package: {
        id: 'learning.mangrove_roots.v1',
        titleMessageId: 'learning.mangroveRoots.title',
        objectiveId: 'objective.mangrove_habitat_stewardship.v1',
        objectiveMessageId: 'learning.mangroveRoots.objective',
        completionCreditId: 'learning.mangrove_roots.v1',
        unlockThreshold: 132,
      },
      release: {
        featureFlag: 'r002b_learning_ui',
        defaultEnabled: false,
        activation: 'blocked',
        contentAuthority: 'candidate_only',
      },
    });
  });

  it('provides nonempty Arabic and English parity under unique stable resource keys', () => {
    const candidate = parseCandidate();
    const messageIds = candidate.messages.map((message) => message.id);
    const claimIds = new Set(candidate.claims.map((claim) => claim.id));

    expect(messageIds.length).toBeGreaterThan(0);
    expect(unique(messageIds)).toHaveLength(messageIds.length);
    for (const message of candidate.messages) {
      expect(message.id).toMatch(/^learning\.mangroveRoots\.[A-Za-z0-9.]+$/u);
      expect(message.ar.trim()).not.toBe('');
      expect(message.en.trim()).not.toBe('');
      expect(message.ar).toMatch(/[\u0600-\u06ff]/u);
      expect(message.en).toMatch(/[A-Za-z]/u);
      expect(message.claimIds.every((claimId) => claimIds.has(claimId))).toBe(true);
    }

    const requiredMessageIds = [
      candidate.package.titleMessageId,
      candidate.package.objectiveMessageId,
      candidate.check.promptMessageId,
      candidate.check.correctOptionMessageId,
      candidate.check.incorrectOptionMessageId,
      candidate.check.retryMessageId,
      candidate.check.successMessageId,
      'learning.mangroveRoots.disclosure',
      'learning.mangroveRoots.sources.note',
      ...candidate.package.routes.story.steps.flatMap((step) => step.messageIds),
      ...candidate.package.routes.accessible.steps.flatMap((step) => step.messageIds),
    ];
    expect(requiredMessageIds.every((id) => messageIds.includes(id))).toBe(true);
  });

  it('keeps Story and accessible routes finite and objectively equal', () => {
    const candidate = parseCandidate();
    const { story, accessible } = candidate.package.routes;
    const expectedClaims = candidate.claims.map((claim) => claim.id).sort();

    expect(story).toMatchObject({
      path: '/garden/learn/learning.mangrove_roots.v1/story',
      objectiveId: candidate.package.objectiveId,
      checkId: candidate.check.id,
    });
    expect(accessible).toMatchObject({
      path: '/garden/learn/learning.mangrove_roots.v1/accessible',
      objectiveId: candidate.package.objectiveId,
      checkId: candidate.check.id,
    });
    expect(story.steps.map((step) => step.stepId)).toEqual(['story_frame_1', 'story_frame_2']);
    expect(accessible.steps.map((step) => step.stepId)).toEqual([
      'accessible_section_1',
      'accessible_section_2',
    ]);
    expect(routeClaimIds(story)).toEqual(expectedClaims);
    expect(routeClaimIds(accessible)).toEqual(expectedClaims);
    expect([...story.claimIds].sort()).toEqual(expectedClaims);
    expect([...accessible.claimIds].sort()).toEqual(expectedClaims);
    expect([...candidate.check.claimIds].sort()).toEqual(expectedClaims);
    const messages = new Map(candidate.messages.map((message) => [message.id, message]));
    for (const route of [story, accessible]) {
      for (const step of route.steps) {
        const messageClaimIds = unique(
          step.messageIds.flatMap((messageId) => messages.get(messageId)?.claimIds ?? []),
        ).sort();
        expect(messageClaimIds).toEqual([...step.claimIds].sort());
      }
    }
    expect(candidate.check).toMatchObject({
      objectiveId: candidate.package.objectiveId,
      correctOptionId: 'habitat_support_and_care',
      incorrectOptionId: 'visit_or_task_reward',
      noFail: true,
      retryHasNoLoss: true,
    });
  });

  it('traces every factual claim to directly opened official UAE sources', () => {
    const candidate = parseCandidate();
    const claims = new Map(candidate.claims.map((claim) => [claim.id, claim]));
    const sources = new Map(candidate.sources.map((source) => [source.id, source]));

    expect(unique(candidate.claims.map((claim) => claim.id))).toHaveLength(candidate.claims.length);
    expect(unique(candidate.sources.map((source) => source.id))).toHaveLength(
      candidate.sources.length,
    );
    for (const claim of claims.values()) {
      expect(claim.mutable).toBe(false);
      expect(claim.ar.trim()).not.toBe('');
      expect(claim.en.trim()).not.toBe('');
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of claim.sourceIds) {
        const source = sources.get(sourceId);
        expect(source, `missing source ${sourceId} for ${claim.id}`).toBeDefined();
        expect(source?.supportsClaimIds).toContain(claim.id);
      }
    }
    for (const source of sources.values()) {
      const hostname = new URL(source.url).hostname;
      expect(['www.ead.gov.ae', 'www.dm.gov.ae']).toContain(hostname);
      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.accessedOn).toBe('2026-09-05');
      expect(source.directAccess).toBe('opened');
      expect(source.humanReview).toBe('not_run');
      expect(source.supportsClaimIds.length).toBeGreaterThan(0);
      expect(source.supportsClaimIds.every((claimId) => claims.has(claimId))).toBe(true);
    }
    expect(candidate.researchGaps.every((gap) => gap.reliedOnByClaimIds.length === 0)).toBe(true);
  });

  it('contains no remote runtime, executable markup, media dependency, or positive impact claim', () => {
    const candidate = parseCandidate();
    const localizedCopy = candidate.messages
      .flatMap((message) => [message.ar, message.en])
      .join('\n');

    expect(localizedCopy).not.toMatch(/https?:\/\//iu);
    expect(localizedCopy).not.toMatch(/<\/?(?:script|iframe|audio|video|img|a)\b/iu);
    expect(localizedCopy).not.toMatch(/javascript:|data:text\/html|onerror\s*=|onclick\s*=/iu);
    expect(localizedCopy).not.toMatch(/\+\s*12|earn(?:ed|s|ing)? Seeds|badge unlocked/iu);
    expect(localizedCopy).not.toMatch(
      /we planted|you planted|verified visit|measured environmental impact/iu,
    );
    expect(localizedCopy).not.toMatch(/غرسنا|زرعت شجرة|زيارة مؤكدة|أثر بيئي مقاس/iu);
    expect(candidate.delivery).toEqual({
      deterministicLocal: true,
      offline: true,
      finite: true,
      autoplayNextLearning: false,
      requiresNetwork: false,
      opensExternalBrowser: false,
      requiresGps: false,
      requiresCamera: false,
      requiresMicrophone: false,
      requiresMedia: false,
    });
    expect(candidate.integration.runtimeRemoteContent).toBe(false);
  });

  it('states zero reward and keeps all named release reviews pending', () => {
    const candidate = parseCandidate();
    const message = (id: string) => candidate.messages.find((entry) => entry.id === id);

    expect(candidate.completionConsequences).toEqual({
      seeds: 0,
      gardenGrowth: 0,
      canopy: 0,
      greenCircle: 0,
      privateLeague: 0,
      challengeLeaf: 0,
      familyReward: 0,
      taskReward: 0,
    });
    expect(message('learning.mangroveRoots.disclosure')?.ar).toContain('لا يمنح بذورًا');
    expect(message('learning.mangroveRoots.disclosure')?.ar).toContain('لا يثبت زيارة');
    expect(message('learning.mangroveRoots.disclosure')?.en).toContain('awards no Seeds');
    expect(message('learning.mangroveRoots.disclosure')?.en).toContain('does not prove a visit');

    expect(candidate.reviewGates).toEqual(
      [
        'source_link_and_mutable_fact_revalidation',
        'arabic_english_factual_equivalence',
        'uae_cultural_and_place_wording',
        'child_safeguarding_and_age_comprehension',
        'accessible_equal_credit_equivalence',
        'original_illustration_and_rights',
      ].map((id) => ({
        id,
        status: 'not_run',
        releaseEffect: 'blocks_release_activation',
      })),
    );
    expect(candidate.integration).toEqual({
      messageIdsAreRecommendedResourceKeys: true,
      singleRuntimeCopyAuthority: 'src/i18n/resources.ts',
      deepFreezeAtAdapterBoundary: true,
      runtimeRemoteContent: false,
    });
  });
});
