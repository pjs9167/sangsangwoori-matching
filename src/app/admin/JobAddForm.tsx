"use client";

import { useActionState } from "react";
import { addJob } from "@/app/actions/job";
import type { AddJobState } from "@/app/actions/job";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"];

const inputCls =
  "border-2 border-gray-400 rounded-lg px-3 py-2 text-lg bg-white focus:outline-none focus:border-blue-600 w-full";

export function JobAddForm() {
  const [state, action, pending] = useActionState<AddJobState, FormData>(
    addJob,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {state && "error" in state && (
        <p className="text-lg font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg px-4 py-2">
          ⚠ {state.error}
        </p>
      )}
      {state && "success" in state && state.success && (
        <p className="text-lg font-medium text-green-700 bg-green-50 border border-green-300 rounded-lg px-4 py-2">
          ✅ 일자리가 등록됐습니다.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* 공고명 */}
        <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
          <label htmlFor="job-title" className="text-lg font-semibold text-gray-700">
            공고명 <span className="text-red-500">*</span>
          </label>
          <input id="job-title" name="title" type="text" className={inputCls} />
        </div>

        {/* 지역 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="job-region" className="text-lg font-semibold text-gray-700">
            지역 <span className="text-red-500">*</span>
          </label>
          <select id="job-region" name="region" defaultValue="" className={inputCls}>
            <option value="" disabled>선택</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* 직종 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="job-type" className="text-lg font-semibold text-gray-700">
            직종 <span className="text-red-500">*</span>
          </label>
          <select id="job-type" name="job_type" defaultValue="" className={inputCls}>
            <option value="" disabled>선택</option>
            {JOB_TYPES.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        {/* 요구 경력 */}
        <div className="flex flex-col gap-1">
          <label htmlFor="job-career" className="text-lg font-semibold text-gray-700">
            요구 경력 (년)
          </label>
          <input
            id="job-career"
            name="required_career"
            type="number"
            min={0}
            max={40}
            defaultValue={0}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-lg font-bold px-6 py-3 rounded-xl transition-colors"
        >
          {pending ? "등록 중…" : "일자리 추가"}
        </button>
      </div>
    </form>
  );
}
