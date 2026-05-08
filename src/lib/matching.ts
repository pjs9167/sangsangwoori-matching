import type { Senior, Job } from "@/types";

// 비교 전용 정규화 — 원본 데이터 불변
const REGION_MAP: Record<string, string> = {
  서울특별시: "서울",
  경기도: "경기",
  인천광역시: "인천",
};

const JOB_MAP: Record<string, string> = {
  경비직: "경비",
  청소직: "청소",
  조리직: "조리",
  돌봄직: "돌봄",
};

function nr(region: string) { return REGION_MAP[region] ?? region; }
function nj(job: string)    { return JOB_MAP[job]    ?? job; }

/**
 * 규칙 기반 매칭 점수 계산 (최대 6점) — 앱 레이어 폴백용
 *
 * 지역 일치  : +3점
 * 직종 일치  : +2점
 * 경력 충족  : +1점
 */
export function calculateScore(senior: Senior, job: Job): number {
  let score = 0;
  if (nr(senior.region)      === nr(job.region))    score += 3;
  if (nj(senior.desired_job) === nj(job.job_type))  score += 2;
  if (senior.career_years >= job.required_career)   score += 1;
  return score;
}
