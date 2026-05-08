"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerSenior } from "@/app/actions/senior";
import type { RegisterState } from "@/app/actions/senior";

const REGIONS = ["서울", "경기", "인천", "기타"];
const JOB_TYPES = ["경비", "청소", "조리", "돌봄", "기타"];

const inputCls =
  "w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-xl bg-white focus:outline-none focus:border-blue-600";
const labelCls = "text-xl font-semibold text-gray-800";
const hintCls  = "text-lg text-gray-500 mb-1";
const errorBoxCls =
  "flex items-center gap-2 text-lg font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg px-4 py-2 mb-1";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerSenior,
    null
  );

  if (state && "success" in state && state.success) {
    return (
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">시니어 일자리 신청하기</h1>
        <div className="flex flex-col items-center gap-6 bg-green-50 border-2 border-green-400 rounded-xl px-8 py-10 text-center">
          <p className="text-5xl">✅</p>
          <p className="text-2xl font-bold text-green-800">등록이 완료되었습니다</p>
          <p className="text-xl text-green-700">
            담당자가 곧 연락드립니다.
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/recommendations"
              className="bg-blue-700 hover:bg-blue-800 text-white text-xl font-bold px-6 py-3 rounded-xl transition-colors min-h-[48px] flex items-center"
            >
              추천 목록 보기
            </Link>
            <Link
              href="/register"
              className="border-2 border-gray-400 hover:border-gray-600 text-gray-700 text-xl font-semibold px-6 py-3 rounded-xl transition-colors min-h-[48px] flex items-center"
            >
              새로 등록하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fieldErrors =
    state && "fields" in state ? state.fields : ({} as Record<string, string>);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">시니어 일자리 신청하기</h1>
      <p className="text-xl text-gray-600 mb-8">
        맞춤 일자리를 찾아드립니다. 아래 정보를 입력해 주세요.
      </p>

      <form action={action} className="flex flex-col gap-6">
        {/* 이름 */}
        <div className="flex flex-col gap-1">
          <p className={hintCls}>성함을 입력해 주세요</p>
          {fieldErrors.name && (
            <p className={errorBoxCls}>⚠ {fieldErrors.name}</p>
          )}
          <label htmlFor="name" className={labelCls}>
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={inputCls}
          />
        </div>

        {/* 지역 */}
        <div className="flex flex-col gap-1">
          <p className={hintCls}>어디에서 일하고 싶으세요?</p>
          {fieldErrors.region && (
            <p className={errorBoxCls}>⚠ {fieldErrors.region}</p>
          )}
          <label htmlFor="region" className={labelCls}>
            지역 <span className="text-red-500">*</span>
          </label>
          <select id="region" name="region" defaultValue="" className={inputCls}>
            <option value="" disabled>
              지역을 선택하세요
            </option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* 희망 직종 */}
        <div className="flex flex-col gap-1">
          <p className={hintCls}>어떤 일을 하시겠어요?</p>
          {fieldErrors.desired_job && (
            <p className={errorBoxCls}>⚠ {fieldErrors.desired_job}</p>
          )}
          <label htmlFor="desired_job" className={labelCls}>
            희망 직종 <span className="text-red-500">*</span>
          </label>
          <select
            id="desired_job"
            name="desired_job"
            defaultValue=""
            className={inputCls}
          >
            <option value="" disabled>
              직종을 선택하세요
            </option>
            {JOB_TYPES.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* 경력 */}
        <div className="flex flex-col gap-1">
          <p className={hintCls}>몇 년 일하셨나요? (없으면 0)</p>
          <label htmlFor="career_years" className={labelCls}>
            경력 (년)
          </label>
          <input
            id="career_years"
            name="career_years"
            type="number"
            min={0}
            max={60}
            defaultValue={0}
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full min-h-[48px] bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white text-2xl font-bold py-4 rounded-xl transition-colors"
        >
          {pending ? "등록 중…" : "등록하기"}
        </button>
      </form>
    </div>
  );
}
