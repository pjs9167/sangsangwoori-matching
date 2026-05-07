export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { SeniorSelector } from "./SeniorSelector";
import type { MatchWithJob, Senior } from "@/types";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score === 6
      ? "bg-yellow-400 text-yellow-900"
      : score >= 4
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={`text-2xl font-bold px-4 py-1 rounded-full ${cls}`}>
      {score}점
    </span>
  );
}

const STATUS_LABEL: Record<string, string> = {
  pending: "대기 중",
  assigned: "배정 완료",
  done: "완료",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  assigned: "bg-green-100 text-green-700",
  done: "bg-blue-100 text-blue-700",
};

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>;
}) {
  const { senior_id } = await searchParams;
  const supabase = db();

  const [{ data: seniors }, matchResult] = await Promise.all([
    supabase.from("seniors").select("*").order("created_at", { ascending: false }),
    senior_id
      ? supabase
          .from("matches")
          .select("*, jobs(*)")
          .eq("senior_id", senior_id)
          .order("score", { ascending: false })
      : Promise.resolve({ data: [] as MatchWithJob[] }),
  ]);

  const matches = (matchResult.data ?? []) as MatchWithJob[];
  const selected = (seniors ?? []).find((s: Senior) => s.id === senior_id);
  const hasMatches = matches.length > 0;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2 text-gray-900">추천 일자리 목록</h1>
      <p className="text-xl text-gray-600 mb-8">
        매칭 점수 높은 순으로 추천 일자리를 보여드립니다.
      </p>

      <SeniorSelector seniors={seniors ?? []} selectedId={senior_id} />

      {/* 선택된 시니어 정보 */}
      {selected && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl px-6 py-4">
          <p className="text-xl text-blue-800 font-semibold">
            {selected.name}님 · {selected.region} · {selected.desired_job} ·
            경력 {selected.career_years}년
          </p>
          <p className="text-lg text-blue-600 mt-1">
            매칭된 일자리 {matches.length}건
          </p>
        </div>
      )}

      {/* 빈 상태 */}
      {senior_id && !hasMatches && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-xl text-gray-500">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-xl font-semibold">현재 매칭되는 일자리가 없습니다</p>
          <p className="text-lg mt-1">조건에 맞는 일자리가 등록되면 자동으로 표시됩니다.</p>
        </div>
      )}

      {!senior_id && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
          <p className="text-3xl mb-3">👆</p>
          <p className="text-xl">시니어를 선택하면 추천 일자리가 표시됩니다.</p>
        </div>
      )}

      {/* 점수 범례 */}
      {hasMatches && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <span className="text-lg text-gray-500 font-semibold self-center">점수:</span>
          <span className="bg-yellow-400 text-yellow-900 text-base font-bold px-3 py-1 rounded-full">6점 — 최고</span>
          <span className="bg-green-100 text-green-800 text-base font-bold px-3 py-1 rounded-full">4–5점 — 우수</span>
          <span className="bg-gray-100 text-gray-700 text-base font-bold px-3 py-1 rounded-full">1–3점 — 참고</span>
        </div>
      )}

      {/* 매칭 카드 목록 */}
      <div className="flex flex-col gap-4">
        {matches.map((m) => (
          <div
            key={m.id}
            className="border-2 border-gray-200 hover:border-blue-300 rounded-xl p-6 flex items-center justify-between bg-white transition-colors"
          >
            <div>
              <p className="text-2xl font-bold text-gray-900">{m.jobs.title}</p>
              <p className="text-xl text-gray-600 mt-1">
                {m.jobs.region} · {m.jobs.job_type}
              </p>
              <p className="text-lg text-gray-500 mt-1">
                필요 경력: {m.jobs.required_career}년 이상
              </p>
              <span
                className={`inline-block mt-3 text-base font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[m.status] ?? "bg-gray-100 text-gray-600"}`}
              >
                {STATUS_LABEL[m.status] ?? m.status}
              </span>
            </div>
            <div className="ml-6 shrink-0 text-center">
              <p className="text-lg text-gray-500 mb-1">매칭 점수</p>
              <ScoreBadge score={m.score} />
              <p className="text-base text-gray-400 mt-1">/ 6점</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
