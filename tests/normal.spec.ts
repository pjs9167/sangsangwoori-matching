import { test, expect } from "@playwright/test";
import { resetDb, insertJob, getLatestSenior } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
  await insertJob({
    title: "경비원 모집",
    region: "서울",
    job_type: "경비",
    required_career: 3,
  });
});

test("시니어 등록 후 6점 매칭 카드가 추천 목록 상단에 표시된다", async ({
  page,
}) => {
  // /register 접속 및 폼 입력
  await page.goto("/register");
  await page.fill("#name", "테스트시니어");
  await page.selectOption("#region", "서울");
  await page.selectOption("#desired_job", "경비");
  await page.locator("#career_years").fill("5");

  await page.click('button[type="submit"]');

  // 성공 메시지 초록 박스 확인
  await expect(page.getByText("등록이 완료되었습니다")).toBeVisible({
    timeout: 15_000,
  });

  // DB에서 방금 생성된 시니어 ID 조회
  const senior = await getLatestSenior();

  // 추천 목록 페이지로 이동
  await page.goto(`/recommendations?senior_id=${senior.id}`);

  // 6점 금색 배지 (bg-yellow-400) 카드가 상단에 있어야 함
  const badge = page.locator(".bg-yellow-400").first();
  await expect(badge).toBeVisible({ timeout: 10_000 });
  await expect(badge).toContainText("6점");
});
