import { expect, test } from "@playwright/test";
import { expectApiRequest, mockRiceExpertApi, signInAs } from "./helpers";

test.describe("Rice Expert E2E smoke tests", () => {
  test("landing page loads knowledge data and sends a RAG chat question", async ({ page }) => {
    await mockRiceExpertApi(page);
    await page.goto("/");

    await expect(page.getByText("Rice Expert").first()).toBeVisible();
    await expect(page.getByText("rice-manual.pdf")).toBeVisible();

    const chatRequest = await expectApiRequest(page, "/chat/", async () => {
      await page
        .getByPlaceholder("พิมพ์คำถามเกี่ยวกับการปลูกข้าว... (Shift+Enter ขึ้นบรรทัดใหม่)")
        .fill("ข้าวควรใส่ปุ๋ยเมื่อไหร่");
      await page.getByLabel("ส่งข้อความ").click();
    });

    expect(chatRequest.postDataJSON()).toMatchObject({
      question: "ข้าวควรใส่ปุ๋ยเมื่อไหร่",
    });
    await expect(page.getByText("คำตอบทดสอบจาก RAG")).toBeVisible();
  });

  test("protected app routes redirect guests back to landing", async ({ page }) => {
    await mockRiceExpertApi(page);
    await page.goto("/app/plots");

    await expect(page).toHaveURL("/");
  });

  test("login stores token role and opens plots page", async ({ page }) => {
    await mockRiceExpertApi(page);
    await page.goto("/login");

    await page.getByPlaceholder("กรอกชื่อผู้ใช้").fill("admin");
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill("password");
    await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();

    await expect(page).toHaveURL(/\/app\/plots/);
    await expect(page.getByText("แปลงทดสอบ")).toBeVisible();
    await expect(page.evaluate(() => localStorage.getItem("rice_expert_role"))).resolves.toBe("admin");
  });

  test("normal user cannot open admin page", async ({ page }) => {
    await mockRiceExpertApi(page);
    await signInAs(page, "user", "farmer");

    await page.goto("/app/admin");

    await expect(page).toHaveURL(/\/app\/plots/);
    await expect(page.getByText("แปลงทดสอบ")).toBeVisible();
  });

  test("admin dashboard shows users, FAQ, and normalized knowledge gaps", async ({ page }) => {
    await mockRiceExpertApi(page);
    await signInAs(page, "admin", "admin");

    await page.goto("/app/admin");

    await expect(page.getByText("จัดการระบบ")).toBeVisible();
    await expect(page.getByText("farmer")).toBeVisible();

    await page.getByRole("button", { name: "Prompt Templates" }).click();
    await expect(page.getByText("ปลูกข้าวยังไง")).toBeVisible();
    await expect(page.getByText("3")).toBeVisible();

    await page.getByRole("button", { name: "ช่องว่างความรู้" }).click();
    await expect(page.getByText("โรคไหม้รักษายังไง")).toBeVisible();
    await expect(page.getByText("2")).toBeVisible();
  });

  test("plots page renders plan cards and toggles a task from dashboard", async ({ page }) => {
    await mockRiceExpertApi(page);
    await signInAs(page, "user", "farmer");

    await page.goto("/app/plots");
    await page.getByText("แปลงทดสอบ").click();

    await expect(page).toHaveURL(/\/app\/plots\/plan-1/);
    await expect(page.getByText("เตรียมดิน").first()).toBeVisible();

    const toggleRequest = await expectApiRequest(page, "/plans/plan-1/tasks/task-1/toggle", async () => {
      await page.getByLabel("ทำเครื่องหมายว่าเสร็จแล้ว: เตรียมดิน").first().click();
    });
    expect(toggleRequest.method()).toBe("PATCH");
  });

  test("floating chat sends plan_context when a plan is active", async ({ page }) => {
    await mockRiceExpertApi(page);
    await signInAs(page, "user", "farmer");

    await page.goto("/app/plots/plan-1");
    await page.getByLabel("เปิดแชท").click();

    const chatRequest = await expectApiRequest(page, "/chat/", async () => {
      await page
        .getByPlaceholder("พิมพ์คำถามเกี่ยวกับการปลูกข้าว... (Shift+Enter ขึ้นบรรทัดใหม่)")
        .fill("วันนี้ควรทำอะไร");
      await page.getByLabel("ส่งข้อความ").click();
    });

    const payload = chatRequest.postDataJSON();
    expect(payload.question).toBe("วันนี้ควรทำอะไร");
    expect(payload.collection).toBe("variety-1");
    expect(payload.plan_context).toContain("[บริบทแปลงนาของผู้ใช้]");
    expect(payload.plan_context).toContain("แปลงทดสอบ");
  });
});
