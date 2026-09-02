var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
var CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type"
};
var localizedTextSchema = {
  type: "object",
  additionalProperties: false,
  properties: { ar: { type: "string" }, en: { type: "string" } },
  required: ["ar", "en"]
};
var missionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    schemaVersion: { type: "string", enum: ["1.0"] },
    title: localizedTextSchema,
    story: localizedTextSchema,
    steps: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          order: { type: "integer", minimum: 1, maximum: 3 },
          instruction: localizedTextSchema
        },
        required: ["order", "instruction"]
      }
    },
    reflectionPrompt: localizedTextSchema,
    impactTarget: {
      type: "object",
      additionalProperties: false,
      properties: {
        value: { type: "integer", minimum: 1 },
        unit: { type: "string", enum: ["grams", "portions"] }
      },
      required: ["value", "unit"]
    },
    evidenceMethod: {
      type: "string",
      enum: ["prepared-evidence", "parent-confirmation", "either"]
    },
    reward: { anyOf: [localizedTextSchema, { type: "null" }] },
    personalization: {
      type: "object",
      additionalProperties: false,
      properties: {
        childAgeBand: { type: "string" },
        foodSituation: localizedTextSchema,
        familyWisdomSummary: localizedTextSchema,
        availableMinutes: { type: "integer", minimum: 1, maximum: 60 }
      },
      required: ["childAgeBand", "foodSituation", "familyWisdomSummary", "availableMinutes"]
    }
  },
  required: [
    "schemaVersion",
    "title",
    "story",
    "steps",
    "reflectionPrompt",
    "impactTarget",
    "evidenceMethod",
    "reward",
    "personalization"
  ]
};
var coachSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    schemaVersion: { type: "string", enum: ["1.0"] },
    requestId: { type: "string" },
    taskId: { type: "string" },
    message: localizedTextSchema,
    quickChoices: { type: "array", maxItems: 3, items: localizedTextSchema },
    askAdult: {
      type: "object",
      additionalProperties: false,
      properties: { label: localizedTextSchema, recommended: { type: "boolean" } },
      required: ["label", "recommended"]
    },
    languageMode: { type: "string", enum: ["ar", "en", "code-switched"] },
    safety: {
      type: "object",
      additionalProperties: false,
      properties: {
        foodSafetyVerdict: { type: "boolean", enum: [false] },
        requiresAdult: { type: "boolean" }
      },
      required: ["foodSafetyVerdict", "requiresAdult"]
    }
  },
  required: [
    "schemaVersion",
    "requestId",
    "taskId",
    "message",
    "quickChoices",
    "askAdult",
    "languageMode",
    "safety"
  ]
};
function json(body, status = 200) {
  return Response.json(body, { status, headers: CORS_HEADERS });
}
__name(json, "json");
function unwrapModelResponse(result) {
  if (!result || typeof result !== "object") throw new Error("Workers AI returned no result");
  const response = result.response;
  if (typeof response === "string") return JSON.parse(response);
  if (response && typeof response === "object") return response;
  return result;
}
__name(unwrapModelResponse, "unwrapModelResponse");
function missionPrompt(request) {
  return [
    "Create one Parent-reviewable Ghaf sustainability mission from this synthetic prototype request.",
    "Return Arabic and English for every localized field and exactly three ordered steps numbered 1, 2, and 3.",
    "Adapt to the child age band, quantity, available time, reward, prepared transcript, and current food situation.",
    "Use clear Modern Standard Arabic. Do not claim to inspect media that is not transcribed in the request.",
    "Never decide food safety, tell a child to eat uncertain food, assign the mission, verify evidence, or bypass Parent approval.",
    `Request JSON: ${JSON.stringify(request)}`
  ].join("\n");
}
__name(missionPrompt, "missionPrompt");
function coachPrompt(request) {
  return [
    "You are Ghaf Coach. Support only the current Parent-approved task in the request.",
    "For ages 6-8 give one very short instruction and an early Ask an adult option.",
    "For ages 9-11 give two or three short steps and quick choices.",
    "For ages 12-14 be concise, respectful, mature, and never babyish.",
    "Return clear Modern Standard Arabic and natural English; understand Arabic-English code-switching.",
    "Do not invent dialect, issue religious or medical rulings, request private data, or provide a food-safety verdict.",
    "Set requiresAdult and recommend Ask an adult whenever adult judgment is needed.",
    "Echo requestId and taskId exactly. The Arabic Ask an adult label must contain \u0627\u0633\u0623\u0644 and the English label must contain Ask.",
    `Request JSON: ${JSON.stringify(request)}`
  ].join("\n");
}
__name(coachPrompt, "coachPrompt");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (request.method !== "POST")
      return json(
        { ok: false, error: { code: "INVALID_INPUT", message: "POST is required" } },
        405
      );
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 32e3)
      return json(
        { ok: false, error: { code: "INVALID_INPUT", message: "Request is too large" } },
        413
      );
    let body;
    try {
      body = await request.json();
    } catch {
      return json(
        { ok: false, error: { code: "INVALID_INPUT", message: "Valid JSON is required" } },
        400
      );
    }
    if (body.operation !== "generateMission" && body.operation !== "respondToCoach") {
      return json(
        { ok: false, error: { code: "INVALID_INPUT", message: "Unknown AI operation" } },
        400
      );
    }
    const isMission = body.operation === "generateMission";
    const schema = isMission ? missionSchema : coachSchema;
    const prompt = isMission ? missionPrompt(body.request) : coachPrompt(body.request);
    try {
      const result = await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, {
        messages: [
          { role: "system", content: "Return only structured JSON matching the supplied schema." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: isMission ? 1500 : 500,
        response_format: { type: "json_schema", json_schema: schema }
      });
      return json({
        ok: true,
        data: unwrapModelResponse(result),
        provider: { name: "cloudflare-workers-ai", model: env.AI_MODEL || DEFAULT_MODEL }
      });
    } catch {
      return json(
        {
          ok: false,
          error: { code: "REMOTE_UNAVAILABLE", message: "Workers AI generation failed" }
        },
        503
      );
    }
  }
};

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-QYa2w0/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-QYa2w0/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
