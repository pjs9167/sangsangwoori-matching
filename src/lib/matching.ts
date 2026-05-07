import type { Senior, Job } from "@/types";

/**
 * 규칙 기반 매칭 점수 계산 (최대 6점) — 앱 레이어 폴백용
 *
 * 지역 일치  : +3점
 * 직종 일치  : +2점
 * 경력 충족  : +1점
 */
export function calculateScore(senior: Senior, job: Job): number {
  let score = 0;
  if (senior.region === job.region) score += 3;
  if (senior.desired_job === job.job_type) score += 2;
  if (senior.career_years >= job.required_career) score += 1;
  return score;
}
