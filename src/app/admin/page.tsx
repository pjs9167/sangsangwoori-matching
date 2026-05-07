import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { JobAddForm } from "./JobAddForm";
import { DeleteJobButton } from "./DeleteJobButton";
import type { Job, Senior } from "@/types";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type SeniorRow = Senior & { maxScore: number; derivedStatus: "unmatched" | "pending" | "assigned" };

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  unmatched: { label: "미매칭", cls: "bg-red-100 text-red-700" },
  pending:   { label: "매칭 대기", cls: "bg-yellow-100 text-yellow-700" },
  assigned:  { label: "배정 완료", cls: "bg-green-100 text-green-700" },
};

export default async function AdminPage() {
  const supabase = db();

  const [{ data: rawSeniors }, { data: rawMatches }, { data: rawJobs }] =
    await Promise.all([
      supabase.from("seniors").select("*").order("created_at", { ascending: false }),
      supabase.from("matches").select("senior_id, score, status"),
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    ]);

  const seniors = rawSeniors ?? [];
  const matches = rawMatches ?? [];
  const jobs = (rawJobs ?? []) as Job[];

  // 시니어별 집계
  const seniorRows: SeniorRow[] = seniors.map((s: Senior) => {
    const sm = matches.filter((m) => m.senior_id === s.id);
    const maxScore = sm.length > 0 ? Math.max(...sm.map((m) => m.score)) : 0;
    let derivedStatus: SeniorRow["derivedStatus"] = "unmatched";
    if (sm.some((m) => ["assigned", "done"].includes(m.status))) derivedStatus = "assigned";
    else if (sm.some((m) => m.status === "pending")) derivedStatus = "pending";
    return { ...s, maxScore, derivedStatus };
  });

  const counts = {
    unmatched: seniorRows.filter((s) => s.derivedStatus === "unmatched").length,
    pending:   seniorRows.filter((s) => s.derivedStatus === "pending").length,
    assigned:  seniorRows.filter((s) => s.derivedStatus === "assigned").length,
  };

  const summaryCards = [
    { key: "unmatched", label: "미매칭 시니어",  count: counts.unmatched, bg: "bg-red-50",    border: "border-red-200"   },
    { key: "pending",   label: "매칭 대기",       count: counts.pending,   bg: "bg-yellow-50", border: "border-yellow-200"},
    { key: "assigned",  label: "배정 완료",        count: counts.assigned,  bg: "bg-green-50",  border: "border-green-200" },
  ] as const;

  return (
    <div className="flex flex-col gap-14">
      {/* ── 매칭 현황 ── */}
      <section>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">담당자 대시보드</h1>
        <p className="text-xl text-gray-600 mb-8">
          시니어 매칭 현황을 한눈에 확인하세요.
        </p>

        {/* 집계 카드 3개 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {summaryCards.map((c) => (
            <div key={c.key} className={`${c.bg} border-2 ${c.border} rounded-xl p-6 text-center`}>
              <p className="text-xl font-semibold text-gray-700">{c.label}</p>
              <p className="text-6xl font-bold text-gray-900 mt-3">{c.count}</p>
              <p className="text-lg text-gray-500 mt-1">명</p>
            </div>
          ))}
        </div>

        {/* 시니어 목록 테이블 */}
        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {["이름", "지역", "희망 직종", "최고 매칭 점수", "상태", ""].map((h) => (
                  <th key={h} className="px-5 py-4 text-lg font-semibold text-gray-700 border-b-2 border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seniorRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xl text-gray-400">
                    등록된 시니어가 없습니다.
                  </td>
                </tr>
              ) : (
                seniorRows.map((s, i) => {
                  const badge = STATUS_BADGE[s.derivedStatus];
                  return (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-5 py-4 text-xl font-bold text-gray-900">{s.name}</td>
                      <td className="px-5 py-4 text-lg text-gray-700">{s.region}</td>
                      <td className="px-5 py-4 text-lg text-gray-700">{s.desired_job}</td>
                      <td className="px-5 py-4">
                        <span className={`text-2xl font-bold ${s.maxScore === 6 ? "text-yellow-600" : s.maxScore >= 4 ? "text-green-600" : "text-gray-500"}`}>
                          {s.maxScore > 0 ? `${s.maxScore}점` : "—"}
                        </span>
                        <span className="text-base text-gray-400 ml-1">/ 6점</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-base font-semibold px-3 py-1 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/recommendations?senior_id=${s.id}`}
                          className="text-base font-semibold px-4 py-2 rounded-lg border-2 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          상세 보기
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 일자리 관리 ── */}
      <section>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">일자리 관리</h2>
        <p className="text-xl text-gray-600 mb-6">
          일자리를 추가하면 기존 시니어와 자동으로 매칭됩니다.
        </p>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">일자리 추가</h3>
          <JobAddForm />
        </div>

        <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {["공고명", "지역", "직종", "요구 경력", ""].map((h) => (
                  <th key={h} className="px-5 py-4 text-lg font-semibold text-gray-700 border-b-2 border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-xl text-gray-400">
                    등록된 일자리가 없습니다.
                  </td>
                </tr>
              ) : (
                jobs.map((job, i) => (
                  <tr key={job.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-4 text-lg font-medium text-gray-900">{job.title}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.region}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.job_type}</td>
                    <td className="px-5 py-4 text-lg text-gray-700">{job.required_career}년 이상</td>
                    <td className="px-5 py-4"><DeleteJobButton jobId={job.id} /></td>
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
