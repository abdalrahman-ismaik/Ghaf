import { PREPARED_COACH_MATERIALS } from './ageAdaptation';
import { PREPARED_VOICE_TRANSCRIPTS } from './voiceSession';
import {
  SYNTHETIC_CHILD_CREDENTIAL_FIXTURES,
  SYNTHETIC_PARENT_ACCESS_FIXTURE,
  SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
  type ChildAccessSession,
  type ChildPermissionGrant,
  type LanguagePreference,
  type ParentAccessSession,
  type SensitiveActionPurpose,
} from '../../models/access';
import type {
  AgeAdaptedCoachResult,
  SyntheticVoiceSession,
  VoiceAccessContext,
  VoicePlaybackInput,
  VoicePlaybackRate,
} from '../../models/assistantVoice';
import type {
  AgeBand,
  DomainErrorCode,
  LocalizedText,
  SyntheticChildId,
} from '../../models/familyGrowth';
import type {
  Feature003ServiceRegistry,
  ServiceResult,
  SessionAuthorityInput,
} from '../../services/interfaces';

export type ChildVoiceActorRole = 'parent' | 'child';
export type ChildVoiceAvailability =
  'parent_permission_required' | 'task_required' | 'ready' | 'active' | 'review' | 'sent';

export interface ChildVoiceView {
  readonly permissionEnabled: boolean;
  readonly languagePreference: LanguagePreference;
  readonly availability: ChildVoiceAvailability;
  readonly taskId: string | null;
  readonly approvedTaskVersion: number | null;
  readonly lifecycle: SyntheticVoiceSession['lifecycle'];
  readonly transcript: LocalizedText | null;
  readonly captionsEnabled: boolean;
  readonly playbackRate: VoicePlaybackRate;
  readonly replayCount: number;
  readonly activeIndicatorVisible: boolean;
  readonly sentAt: string | null;
  readonly origin: 'synthetic';
}

export interface ConfigureChildVoicePermissionInput {
  readonly actorRole: ChildVoiceActorRole;
  readonly childId: SyntheticChildId;
  readonly languagePreference: LanguagePreference;
  readonly enabled: boolean;
}

export interface ChildVoiceTaskContext {
  readonly actorRole: ChildVoiceActorRole;
  readonly childId: SyntheticChildId;
  readonly ageBand: AgeBand;
  readonly taskId: string;
  readonly approvedTaskVersion: number;
  readonly lifecycle: 'chosen' | 'in_progress';
  readonly approvedByParent: boolean;
}

export type ChildVoiceCommand =
  | { readonly type: 'start' }
  | { readonly type: 'stop' }
  | { readonly type: 'delete' }
  | { readonly type: 'send' }
  | { readonly type: 'replay' }
  | { readonly type: 'reset' }
  | {
      readonly type: 'playback';
      readonly captionsEnabled: boolean;
      readonly playbackRate: VoicePlaybackRate;
    };

export const INITIAL_CHILD_VOICE_VIEW: ChildVoiceView = Object.freeze({
  permissionEnabled: false,
  languagePreference: 'ar',
  availability: 'parent_permission_required',
  taskId: null,
  approvedTaskVersion: null,
  lifecycle: 'idle',
  transcript: null,
  captionsEnabled: true,
  playbackRate: 1,
  replayCount: 0,
  activeIndicatorVisible: false,
  sentAt: null,
  origin: 'synthetic',
});

type VoiceRegistry = Pick<
  Feature003ServiceRegistry,
  'access' | 'coachAdaptation' | 'syntheticVoice'
>;

function failure(code: DomainErrorCode, message: string): ServiceResult<never> {
  return {
    ok: false,
    error: { code, message, retryable: false, fallbackAvailable: false },
  };
}

function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data, meta: { origin: 'synthetic', fallbackUsed: false } };
}

function cloneView(view: ChildVoiceView): ChildVoiceView {
  return {
    ...view,
    transcript: view.transcript ? { ...view.transcript } : null,
  };
}

function permissionPurpose(kind: 'voice' | 'ai'): SensitiveActionPurpose {
  return kind === 'voice' ? 'change_voice_permission' : 'change_ai_permission';
}

export class ChildVoiceController {
  private parentSession: ParentAccessSession | null = null;
  private childSession: ChildAccessSession | null = null;
  private grant: ChildPermissionGrant | null = null;
  private voiceSession: SyntheticVoiceSession | null = null;
  private taskContext: Omit<ChildVoiceTaskContext, 'actorRole' | 'ageBand'> | null = null;
  private sequence = 0;

  constructor(private readonly registry: VoiceRegistry) {}

  getView(): ChildVoiceView {
    return cloneView(this.projectView());
  }

  configureParentPermission(
    input: ConfigureChildVoicePermissionInput,
  ): ServiceResult<ChildVoiceView> {
    if (input.actorRole !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent can change prepared voice permission');
    }
    const authority = this.ensureSyntheticAuthority(input.childId);
    if (!authority.ok) return authority;

    if (this.voiceSession) {
      const reset = this.registry.syntheticVoice.reset(this.voiceSession, this.childAuthority());
      if (!reset.ok) return reset;
      this.voiceSession = reset.data;
    }

    if (this.grant?.languagePreference !== input.languagePreference) {
      const language = this.registry.access.updateChildPermissions({
        parentSession: this.parentSession!,
        childId: input.childId,
        expectedVersion: this.grant!.version,
        change: { kind: 'language', value: input.languagePreference },
        now: this.nextTime(),
      });
      if (!language.ok) return language;
      this.grant = language.data;
    }

    const voice = this.updateSensitiveGrant('voice', input.enabled);
    if (!voice.ok) return voice;
    const ai = this.updateSensitiveGrant('ai', input.enabled);
    if (!ai.ok) return ai;

    this.voiceSession = null;
    this.taskContext = null;
    return success(this.getView());
  }

  adaptCoach(context: ChildVoiceTaskContext): ServiceResult<AgeAdaptedCoachResult> {
    if (context.actorRole !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child can open task coaching');
    }
    return this.registry.coachAdaptation.adaptPreparedResult({
      context: {
        childId: context.childId,
        ageBand: context.ageBand,
        taskId: context.taskId,
        approvedTaskVersion: context.approvedTaskVersion,
        lifecycle: context.lifecycle,
        approvedByParent: context.approvedByParent,
      },
      material: PREPARED_COACH_MATERIALS.coach_recycling_steps_v1,
    });
  }

  bindActiveTask(context: ChildVoiceTaskContext): ServiceResult<ChildVoiceView> {
    if (context.actorRole !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child can open the prepared voice rehearsal');
    }
    if (!this.permissionIsEnabled() || !this.childSession || !this.grant) {
      return failure('PRIVACY_REJECTED', 'Parent voice and AI permission is required');
    }

    const access = this.voiceAccess(context);
    if (
      this.voiceSession &&
      this.voiceSession.childId === context.childId &&
      this.voiceSession.taskId === context.taskId &&
      this.voiceSession.approvedTaskVersion === context.approvedTaskVersion &&
      this.voiceSession.permissionVersion === this.grant.version
    ) {
      this.taskContext = context;
      return success(this.getView());
    }

    const created = this.registry.syntheticVoice.createIdle(
      {
        voiceSessionId: `child-voice-presentation-${this.grant.version}-${this.nextSequence()}`,
        access,
      },
      this.childAuthority(),
    );
    if (!created.ok) return created;
    this.voiceSession = created.data;
    this.taskContext = context;
    return success(this.getView());
  }

  start(actorRole: ChildVoiceActorRole): ServiceResult<ChildVoiceView> {
    const ready = this.requireVoiceSession(actorRole);
    if (!ready.ok) return ready;
    return this.commitVoiceResult(
      this.registry.syntheticVoice.start(
        ready.data,
        this.voiceAccess(this.taskContext!),
        this.childAuthority(),
      ),
    );
  }

  stop(actorRole: ChildVoiceActorRole): ServiceResult<ChildVoiceView> {
    const ready = this.requireVoiceSession(actorRole);
    if (!ready.ok) return ready;
    const fixture = PREPARED_VOICE_TRANSCRIPTS.voice_recycling_complete_v1;
    return this.commitVoiceResult(
      this.registry.syntheticVoice.stopWithPreparedTranscript(
        ready.data,
        {
          access: this.voiceAccess(this.taskContext!),
          transcriptFixtureId: 'voice_recycling_complete_v1',
          transcript: fixture.transcript,
        },
        this.childAuthority(),
      ),
    );
  }

  deleteBeforeSend(actorRole: ChildVoiceActorRole): ServiceResult<ChildVoiceView> {
    const ready = this.requireVoiceSession(actorRole);
    if (!ready.ok) return ready;
    return this.commitVoiceResult(
      this.registry.syntheticVoice.deleteBeforeSend(ready.data, this.childAuthority()),
    );
  }

  send(actorRole: ChildVoiceActorRole): ServiceResult<ChildVoiceView> {
    const ready = this.requireVoiceSession(actorRole);
    if (!ready.ok) return ready;
    return this.commitVoiceResult(
      this.registry.syntheticVoice.send(ready.data, this.nextTime(), this.childAuthority()),
    );
  }

  setPlayback(
    actorRole: ChildVoiceActorRole,
    input: VoicePlaybackInput,
  ): ServiceResult<ChildVoiceView> {
    const ready = this.requireVoiceSession(actorRole);
    if (!ready.ok) return ready;
    return this.commitVoiceResult(
      this.registry.syntheticVoice.setPlayback(ready.data, input, this.childAuthority()),
    );
  }

  replay(actorRole: ChildVoiceActorRole): ServiceResult<ChildVoiceView> {
    const ready = this.requireVoiceSession(actorRole);
    if (!ready.ok) return ready;
    return this.commitVoiceResult(
      this.registry.syntheticVoice.replay(ready.data, this.childAuthority()),
    );
  }

  resetVoice(actorRole: ChildVoiceActorRole): ServiceResult<ChildVoiceView> {
    const ready = this.requireVoiceSession(actorRole);
    if (!ready.ok) return ready;
    return this.commitVoiceResult(
      this.registry.syntheticVoice.reset(ready.data, this.childAuthority()),
    );
  }

  resetPrototype(actorRole: ChildVoiceActorRole): ServiceResult<ChildVoiceView> {
    if (actorRole !== 'parent') {
      return failure('INVALID_TRANSITION', 'Only the Parent can reset prepared voice permission');
    }
    if (!this.parentSession || !this.childSession || !this.grant) {
      return success(cloneView(INITIAL_CHILD_VOICE_VIEW));
    }

    if (this.voiceSession) {
      const reset = this.registry.syntheticVoice.reset(this.voiceSession, this.childAuthority());
      if (!reset.ok) return reset;
    }
    const voice = this.updateSensitiveGrant('voice', false);
    if (!voice.ok) return voice;
    const ai = this.updateSensitiveGrant('ai', false);
    if (!ai.ok) return ai;

    this.voiceSession = null;
    this.taskContext = null;
    return success(this.getView());
  }

  private ensureSyntheticAuthority(childId: SyntheticChildId): ServiceResult<true> {
    if (this.parentSession && this.childSession && this.grant) {
      return this.childSession.principal.childId === childId
        ? success(true)
        : failure('PRIVACY_REJECTED', 'Prepared voice authority belongs to another Child');
    }

    const parent = this.registry.access.signInParent({
      sessionId: 'child-voice-parent-session-v1',
      parentFixtureId: SYNTHETIC_PARENT_ACCESS_FIXTURE.fixtureId,
      deviceId: 'child-voice-parent-device-v1',
      now: this.nextTime(),
    });
    if (!parent.ok) return parent;
    const childDeviceId = `child-voice-${childId}-device-v1`;
    const pairing = this.registry.access.requestPairing({
      requestId: `child-voice-${childId}-pairing-v1`,
      pairingCode: `synthetic-code-child-voice-${childId}-v1`,
      childId,
      requestingDeviceId: childDeviceId,
      now: this.nextTime(),
    });
    if (!pairing.ok) return pairing;
    const approved = this.registry.access.approvePairing({
      requestId: pairing.data.id,
      childId,
      requestingDeviceId: childDeviceId,
      parentSession: parent.data,
      now: this.nextTime(),
    });
    if (!approved.ok) return approved;
    const childFixture = SYNTHETIC_CHILD_CREDENTIAL_FIXTURES[childId];
    const child = this.registry.access.consumePairing({
      requestId: pairing.data.id,
      pairingCode: pairing.data.pairingCode,
      childId,
      deviceId: childDeviceId,
      childCredentialFixtureId: childFixture.fixtureId,
      sessionId: `child-voice-${childId}-session-v1`,
      now: this.nextTime(),
    });
    if (!child.ok) return child;
    const grant = this.registry.access.getChildPermissions({
      session: parent.data,
      childId,
      now: this.nextTime(),
    });
    if (!grant.ok) return grant;

    this.parentSession = parent.data;
    this.childSession = child.data;
    this.grant = grant.data;
    return success(true);
  }

  private updateSensitiveGrant(
    kind: 'voice' | 'ai',
    enabled: boolean,
  ): ServiceResult<ChildPermissionGrant> {
    if (!this.parentSession || !this.grant) {
      return failure('PRIVACY_REJECTED', 'Synthetic Parent authority is unavailable');
    }
    const current = kind === 'voice' ? this.grant.voiceGranted : this.grant.aiGranted;
    if (current === enabled) return success(this.grant);

    const proof = this.registry.access.issueReauthentication({
      proofId: `child-voice-${kind}-proof-${this.nextSequence()}`,
      parentSession: this.parentSession,
      reauthenticationFixtureId: SYNTHETIC_PARENT_REAUTHENTICATION_FIXTURE_ID,
      purpose: permissionPurpose(kind),
      now: this.nextTime(),
    });
    if (!proof.ok) return proof;
    const updated = this.registry.access.updateChildPermissions({
      parentSession: this.parentSession,
      childId: this.grant.childId,
      expectedVersion: this.grant.version,
      change: { kind, granted: enabled, proofId: proof.data.id },
      now: this.nextTime(),
    });
    if (!updated.ok) return updated;
    this.grant = updated.data;
    return updated;
  }

  private requireVoiceSession(
    actorRole: ChildVoiceActorRole,
  ): ServiceResult<SyntheticVoiceSession> {
    if (actorRole !== 'child') {
      return failure('INVALID_TRANSITION', 'Only the Child can use the prepared voice rehearsal');
    }
    if (!this.voiceSession || !this.taskContext || !this.permissionIsEnabled()) {
      return failure('PRIVACY_REJECTED', 'Prepared voice is not enabled and bound to this task');
    }
    return success(this.voiceSession);
  }

  private voiceAccess(
    context: Omit<ChildVoiceTaskContext, 'actorRole' | 'ageBand'>,
  ): VoiceAccessContext {
    return {
      childId: context.childId,
      accessSessionId: this.childSession!.id,
      taskId: context.taskId,
      approvedTaskVersion: context.approvedTaskVersion,
      lifecycle: context.lifecycle,
      approvedByParent: context.approvedByParent,
      grant: {
        childId: this.grant!.childId,
        version: this.grant!.version,
        voiceEnabled: this.grant!.voiceGranted,
        aiEnabled: this.grant!.aiGranted,
      },
    };
  }

  private childAuthority(): SessionAuthorityInput {
    return { session: this.childSession!, now: this.nextTime() };
  }

  private commitVoiceResult(
    result: ServiceResult<SyntheticVoiceSession>,
  ): ServiceResult<ChildVoiceView> {
    if (!result.ok) return result;
    this.voiceSession = result.data;
    return success(this.getView());
  }

  private permissionIsEnabled(): boolean {
    return Boolean(this.grant?.voiceGranted && this.grant.aiGranted);
  }

  private projectView(): ChildVoiceView {
    const session = this.voiceSession;
    const permissionEnabled = this.permissionIsEnabled();
    const availability: ChildVoiceAvailability = !permissionEnabled
      ? 'parent_permission_required'
      : !session
        ? 'task_required'
        : session.lifecycle === 'recording'
          ? 'active'
          : session.lifecycle === 'transcript_review'
            ? 'review'
            : session.lifecycle === 'sent'
              ? 'sent'
              : 'ready';
    return {
      permissionEnabled,
      languagePreference: this.grant?.languagePreference ?? 'ar',
      availability,
      taskId: session?.taskId ?? null,
      approvedTaskVersion: session?.approvedTaskVersion ?? null,
      lifecycle: session?.lifecycle ?? 'idle',
      transcript: session?.transcript ? { ...session.transcript } : null,
      captionsEnabled: session?.captionsEnabled ?? true,
      playbackRate: session?.playbackRate ?? 1,
      replayCount: session?.replayCount ?? 0,
      activeIndicatorVisible: session?.recordingVisible ?? false,
      sentAt: session?.sentAt ?? null,
      origin: 'synthetic',
    };
  }

  private nextSequence(): number {
    this.sequence += 1;
    return this.sequence;
  }

  private nextTime(): string {
    return new Date(Date.UTC(2026, 8, 2, 10, 0, this.nextSequence())).toISOString();
  }
}

export function createChildVoiceController(registry: VoiceRegistry): ChildVoiceController {
  return new ChildVoiceController(registry);
}
