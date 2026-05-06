import type { Senior, Job } from "@/types";

/**
 * 규칙 기반 매칭 점수 계산 (최대 100점)
 *
 * 지역 일치  : +40점
 * 직종 일치  : +40점  (desired_job ↔ job_type 부분 문자열 비교)
 * 경력 충족  : +20점  (100%), +10점 (70% 이상)
 */
export function calculateScore(senior: Senior, job: Job): number {
  let score = 0;

  // 지역 매칭
  if (senior.region === job.region) score += 40;

  // 직종 매칭 (양방향 포함 검사)
  const want = senior.desired_job.toLowerCase().trim();
  const type = job.job_type.toLowerCase().trim();
  if (want.includes(type) || type.includes(want)) score += 40;

  // 경력 매칭
  if (senior.career_years >= job.required_career) {
    score += 20;
  } else if (job.required_career > 0 && senior.career_years >= job.required_career * 0.7) {
    score += 10;
  }

  return score;
}
