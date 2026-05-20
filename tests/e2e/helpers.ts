import { expect, type Page, type Route } from "@playwright/test";

const API_BASE_URL = "http://localhost:8000";

type Role = "user" | "admin";

function base64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function fakeJwt(role: Role, username = role === "admin" ? "admin" : "farmer") {
  const header = base64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({ sub: username, role }));
  return `${header}.${payload}.signature`;
}

export async function signInAs(page: Page, role: Role = "user", username?: string) {
  await page.addInitScript(
    ({ token, roleValue, user }) => {
      localStorage.setItem("rice_expert_access_token", token);
      localStorage.setItem("rice_expert_role", roleValue);
      localStorage.setItem("rice_expert_username", user);
    },
    {
      token: fakeJwt(role, username),
      roleValue: role,
      user: username ?? (role === "admin" ? "admin" : "farmer"),
    },
  );
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export const mockVarieties = [
  {
    id: "variety-1",
    name: "ข้าวหอมมะลิ 105",
    collection_name: "jasmine105",
    harvest_age_days: 120,
    is_photoperiod_sensitive: false,
    supported_methods: ["direct_seed", "transplant"],
    description: "พันธุ์หอม คุณภาพดี",
    reference_url: "https://example.com/jasmine105",
    tillering_day: 30,
    panicle_initiation_day: 55,
    heading_day: 85,
    fert1_rate: 20,
    fert2_rate: 10,
    fert2_formula: "46-0-0",
    fert1_note: "",
    fert2_note: "",
  },
];

export const mockPlans = [
  {
    id: "plan-1",
    variety_id: "variety-1",
    variety_name: "ข้าวหอมมะลิ 105",
    start_date: "2026-06-01",
    actual_planting_date: "2026-06-08",
    area_rai: 5,
    plot_name: "แปลงทดสอบ",
    planting_method: "direct_seed",
    soil_type: "clay",
    is_photoperiod_sensitive: false,
    resources: {
      seed_kg: 75,
      fertilizer1_kg: 100,
      fertilizer1_formula: "16-20-0",
      fertilizer2_kg: 50,
      fertilizer2_formula: "46-0-0",
    },
    tasks: [
      {
        id: "task-1",
        day: 0,
        stage: "เตรียมดิน",
        task_name: "เตรียมดิน",
        description: "ไถดะและปรับพื้นที่",
        date: "2026-06-01",
        is_completed: false,
      },
      {
        id: "task-2",
        day: 7,
        stage: "ปลูก",
        task_name: "หว่านเมล็ด",
        description: "หว่านเมล็ดพันธุ์",
        date: "2026-06-08",
        is_completed: false,
      },
    ],
    created_at: "2026-05-20T10:00:00",
  },
];

export async function mockRiceExpertApi(page: Page, overrides: Record<string, unknown> = {}) {
  await page.route(`${API_BASE_URL}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const key = `${request.method()} ${url.pathname}`;

    if (key in overrides) {
      const value = overrides[key];
      if (typeof value === "function") {
        return (value as (route: Route) => Promise<void> | void)(route);
      }
      return json(route, value);
    }

    if (key === "GET /documents/") {
      return json(route, [
        {
          id: "doc-1",
          filename: "rice-manual.pdf",
          file_type: "pdf",
          chroma_collection: "general",
          created_at: "2026-05-20T10:00:00",
        },
      ]);
    }

    if (key === "GET /documents/collections") {
      return json(route, [
        { value: "general", label: "ทั่วไป" },
        { value: "jasmine105", label: "ข้าวหอมมะลิ 105" },
      ]);
    }

    if (key === "GET /prompts/") {
      return json(route, [
        {
          id: "prompt-1",
          title: "ปุ๋ยข้าว",
          content: "ข้าวควรใส่ปุ๋ยเมื่อไหร่?",
          created_at: "2026-05-20T10:00:00",
        },
      ]);
    }

    if (key === "GET /varieties/") {
      return json(route, mockVarieties);
    }

    if (key === "GET /plans/") {
      return json(route, mockPlans);
    }

    if (key === "GET /admin/users") {
      return json(route, [
        { id: "user-1", username: "farmer", role: "user", created_at: "2026-05-20T10:00:00" },
        { id: "admin-1", username: "admin", role: "admin", created_at: "2026-05-20T09:00:00" },
      ]);
    }

    if (key === "GET /admin/faq") {
      return json(route, [{ question: "ปลูกข้าวยังไง", count: 3 }]);
    }

    if (key === "GET /admin/gaps") {
      return json(route, [
        {
          question: "โรคไหม้รักษายังไง",
          count: 2,
          last_asked_at: "2026-05-20T10:00:00",
        },
      ]);
    }

    if (key === "GET /chat/history") {
      return json(route, []);
    }

    if (key === "POST /auth/login") {
      const body = request.postDataJSON() as { username: string };
      const role = body.username === "admin" ? "admin" : "user";
      return json(route, { access_token: fakeJwt(role, body.username), token_type: "bearer" });
    }

    if (key === "POST /auth/register") {
      const body = request.postDataJSON() as { username: string };
      return json(route, { id: "new-user", username: body.username, role: "user" }, 201);
    }

    if (key === "POST /chat/") {
      return json(route, {
        answer: "คำตอบทดสอบจาก RAG",
        sources: ["rice-manual.pdf"],
        response_time_ms: 120,
        model_used: "gemini-test",
        embedding_model: "embedding-test",
        retrieval_strategy: "similarity",
        chunk_size: 1000,
        retrieval_k: 4,
        chunks_retrieved: 2,
        input_tokens: 100,
        output_tokens: 40,
      });
    }

    if (key === "POST /chat/no-rag") {
      return json(route, {
        answer: "คำตอบทดสอบแบบไม่ใช้ RAG",
        sources: [],
        response_time_ms: 80,
        model_used: "gemini-test",
        embedding_model: "embedding-test",
        retrieval_strategy: "none",
        chunk_size: 0,
        retrieval_k: 0,
        chunks_retrieved: 0,
        input_tokens: 20,
        output_tokens: 20,
      });
    }

    if (key === "PATCH /plans/plan-1/tasks/task-1/toggle") {
      return json(route, { ...mockPlans[0].tasks[0], is_completed: true });
    }

    if (key === "DELETE /plans/plan-1") {
      return route.fulfill({ status: 204 });
    }

    return json(route, { detail: `Unhandled mock route: ${key}` }, 404);
  });
}

export async function expectApiRequest(
  page: Page,
  urlPart: string,
  action: () => Promise<void>,
) {
  const [request] = await Promise.all([
    page.waitForRequest((req) => req.url().includes(urlPart)),
    action(),
  ]);
  expect(request).toBeTruthy();
  return request;
}
