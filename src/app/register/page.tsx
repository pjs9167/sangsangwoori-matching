"use client";

import { useActionState } from "react";
import { registerSenior } from "@/app/actions/senior";

const REGIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerSenior, null);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">프로필 등록</h1>
      <p className="text-xl text-gray-600 mb-8">
        일자리 매칭을 위해 기본 정보를 입력해 주세요.
      </p>

      <form action={action} className="flex flex-col gap-6">
        {/* 이름 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-xl font-semibold text-gray-800">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="border-2 border-gray-400 rounded-lg px-4 py-3 text-xl focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* 지역 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="region" className="text-xl font-semibold text-gray-800">
            지역
          </label>
          <select
            id="region"
            name="region"
            required
            defaultValue=""
            className="border-2 border-gray-400 rounded-lg px-4 py-3 text-xl bg-white focus:outline-none focus:border-blue-600"
          >
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
        <div className="flex flex-col gap-2">
          <label htmlFor="desired_job" className="text-xl font-semibold text-gray-800">
            희망 직종
          </label>
          <input
            id="desired_job"
            name="desired_job"
            type="text"
            required
            className="border-2 border-gray-400 rounded-lg px-4 py-3 text-xl focus:outline-none focus:border-blue-600"
          />
          <p className="text-lg text-gray-500">예: 경비, 청소, 배달, 사무, 요양 등</p>
        </div>

        {/* 경력 연수 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="career_years" className="text-xl font-semibold text-gray-800">
            경력 연수
          </label>
          <input
            id="career_years"
            name="career_years"
            type="number"
            min={0}
            max={60}
            required
            defaultValue={0}
            className="border-2 border-gray-400 rounded-lg px-4 py-3 text-xl focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* 오류 메시지 */}
        {state?.error && (
          <p className="text-red-600 text-xl font-semibold bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            ⚠ {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white text-2xl font-bold py-4 rounded-xl transition-colors"
        >
          {pending ? "매칭 중…" : "등록하기"}
        </button>
      </form>
    </div>
  );
}
