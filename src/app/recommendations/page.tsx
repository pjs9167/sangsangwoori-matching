import { createClient } from "@supabase/supabase-js";
import { SeniorSelector } from "./SeniorSelector";
import type { MatchWithJob, Senior } from "@/types";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const STATUS_LABEL: Record<string, string> = {
  unmatched: "미매칭",
  pending: "대기 중",
  assigned: "배정 완료",
};
const STATUS_COLOR: Record<string, string> = {
  unmatched: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  assigned: "bg-green-100 text-green-700",
};

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ senior_id?: string }>;
}) {
  const { senior_id } = await searchParams;
  const supabase = db();

  const [{ data: seniors }, matchResult] = await Promise.all([
    supabase
      .from("seniors")
      .select("*")
      .order("created_at", { ascending: false }),
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

      {/* 결과 없음 */}
      {senior_id && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-xl">조건에 맞는 일자리가 없습니다.</p>
        </div>
      )}

      {/* 미선택 안내 */}
      {!senior_id && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
          <p className="text-2xl mb-2">👆</p>
          <p className="text-xl">시니어를 선택하면 추천 일자리가 표시됩니다.</p>
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
                className={`inline-block mt-3 text-base font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[m.status]}`}
              >
                {STATUS_LABEL[m.status]}
              </span>
            </div>
            <div className="text-center ml-6 shrink-0">
              <p className="text-lg text-gray-500">매칭 점수</p>
              <p className="text-5xl font-bold text-blue-700">{m.score}</p>
              <p className="text-lg text-gray-400">/ 100</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
