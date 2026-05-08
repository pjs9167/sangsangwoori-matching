import { test, expect } from "@playwright/test";
import { resetDb, insertJob, getLatestSenior } from "./helpers/db";

// 점수 계산: 지역 일치 +3 / 직종 일치 +2 / 경력 충족 +1
// 공고(기타/기타/required_career=10) vs 시니어(서울/경비/3년)
//   → 지역 불일치(0) + 직종 불일치(0) + 3 < 10 이므로 경력 미충족(0) = 합계 0점
//   → score=0 이라 matches 에 삽입되지 않아 "매칭 없음" 상태가 됨
// ※ required_career=0 이면 경력 점수 +1 이 붙어 score=1>0 으로 매칭이 생성되므로
//    "절대 안 맞는" 조건을 보장하기 위해 required_career=10 을 사용함

test.beforeEach(async () => {
  await resetDb();
  await insertJob({
    title: "기타 업무",
    region: "기타",
    job_type: "기타",
    required_career: 10,
  });
});

test("매칭 없을 때 안내 박스 표시", async ({ page }) => {
  await page.goto("/register");
  await page.fill("#name", "노매치시니어");
  await page.selectOption("#region", "서울");
  await page.selectOption("#desired_job", "경비");
  await page.locator("#career_years").fill("3");

  await page.click('button[type="submit"]');

  await expect(page.getByText("등록이 완료되었습니다")).toBeVisible({
    timeout: 15_000,
  });

  const senior = await getLatestSenior();
  await page.goto(`/recommendations?senior_id=${senior.id}`);

  await expect(
    page.getByText("현재 매칭되는 일자리가 없습니다")
  ).toBeVisible({ timeout: 10_000 });
});
