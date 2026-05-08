import { test, expect } from "@playwright/test";
import { resetDb, countSeniors } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
});

test("이름 미입력 시 빨간 안내 박스 표시, DB 레코드 추가 없음", async ({
  page,
}) => {
  await page.goto("/register");

  // 이름 필드 비움 (기본값 유지)
  await page.selectOption("#region", "서울");
  await page.selectOption("#desired_job", "경비");
  await page.locator("#career_years").fill("3");

  await page.click('button[type="submit"]');

  // 이름 필드 위 빨간 안내 박스 확인
  const errorBox = page.locator("p.text-red-700").first();
  await expect(errorBox).toBeVisible({ timeout: 10_000 });
  await expect(errorBox).toContainText("이름을 입력해 주세요.");

  // seniors 테이블에 새 레코드가 없어야 함
  const count = await countSeniors();
  expect(count).toBe(0);
});
