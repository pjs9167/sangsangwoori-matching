import { createClient } from "@supabase/supabase-js";
import { StatusButton } from "./StatusButton";
import { JobAddForm } from "./JobAddForm";
import { DeleteJobButton } from "./DeleteJobButton";
import type { MatchWithAll, Job } from "@/types";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const COLUMNS = [
  {
    key: "unmatched" as const,
    label: "미매칭",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    next: "pending" as const,
    nextLabel: "→ 대기로",
  },
  {
    key: "pending" as const,
    label: "매칭 대기",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    next: "assigned" as const,
    nextLabel: "→ 배정 완료",
  },
  {
    key: "assigned" as const,
    label: "배정 완료",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    next: null,
    nextLabel: null,
  },
] as const;

export default async function AdminPage() {
  const supabase = db();

  const [{ data: matchData }, { data: jobData }] = await Promise.all([
    supabase
      .from("matches")
      .select("*, jobs(*), seniors(*)")
      .order("score", { ascending: false }),
    supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const matches = (matchData ?? []) as MatchWithAll[];
  const jobs = (jobData ?? []) as Job[];

  const grouped = {
    unmatched: matches.filter((m) => m.status === "unmatched"),
    pending: matches.filter((m) => m.status === "pending"),
    assigned: matches.filter((m) => m.status === "assigned"),
  };

  return (
    <div className="flex flex-col gap-12">
      {/* ── 매칭 현황 섹션 ── */}
      <section>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">담당자 대시보드</h1>
        <p className="text-xl text-gray-600 mb-8">
          매칭 현황을 한눈에 확인하고 상태를 변경하세요.
        </p>

        {/* 요약 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className={`${col.bg} border-2 ${col.border} rounded-xl p-5 text-center`}
            >
              <p className="text-xl font-semibold text-gray-700">{col.label}</p>
              <p className="text-5xl font-bold text-gray-900 mt-2">
                {grouped[col.key].length}
              </p>
              <p className="text-lg text-gray-500 mt-1">건</p>
            </div>
          ))}
        </div>

        {/* 칸반 보드 */}
        <div className="grid grid-cols-3 gap-6">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className={`${col.bg} border-2 ${col.border} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{col.label}</h2>
                <span className={`${col.badge} text-lg font-semibold px-3 py-1 rounded-full`}>
                  {grouped[col.key].length}
                </span>
              </div>

              {grouped[col.key].length === 0 ? (
                <div className="flex items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-xl text-gray-400">
                  <p className="text-xl">없음</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {grouped[col.key].map((m) => (
                    <div
                      key={m.id}
                      className="bg-white border border-gray-200 rounded-xl p-4"
                    >
                      <p className="text-lg font-bold text-gray-900">{m.seniors.name}</p>
                      <p className="text-base text-gray-500">
                        {m.seniors.region} · {m.seniors.desired_job} ·{" "}
                        {m.seniors.career_years}년
                      </p>
                      <hr className="my-2 border-gray-100" />
                      <p className="text-base font-semibold text-gray-700">
                        {m.jobs.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {m.jobs.region} · {m.jobs.job_type}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-2xl font-bold text-blue-700">
                          {m.score}점
                        </span>
                        {col.next && (
                          <StatusButton
                            matchId={m.id}
                            nextStatus={col.next}
                            label={col.nextLabel!}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 일자리 관리 섹션 ── */}
      <section>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">일자리 관리</h2>
        <p className="text-xl text-gray-600 mb-6">
          일자리를 추가하거나 삭제할 수 있습니다.
        </p>

        {/* 추가 폼 */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">일자리 추가</h3>
          <JobAddForm />
        </div>

        {/* 일자리 목록 테이블 */}
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {["공고명", "지역", "직종", "요구 경력", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-lg font-semibold text-gray-700 border-b-2 border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-xl text-gray-400"
                  >
                    등록된 일자리가 없습니다.
                  </td>
                </tr>
              ) : (
                jobs.map((job, i) => (
                  <tr
                    key={job.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-5 py-4 text-lg font-medium text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.region}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.job_type}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">
                      {job.required_career}년 이상
                    </td>
                    <td className="px-5 py-4">
                      <DeleteJobButton jobId={job.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
