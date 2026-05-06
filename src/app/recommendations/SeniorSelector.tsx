"use client";

import { useRouter } from "next/navigation";
import type { Senior } from "@/types";

export function SeniorSelector({
  seniors,
  selectedId,
}: {
  seniors: Senior[];
  selectedId?: string;
}) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = (e.currentTarget.elements.namedItem("senior_id") as HTMLSelectElement).value;
    if (id) router.push(`/recommendations?senior_id=${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-8 flex-wrap">
      <select
        name="senior_id"
        defaultValue={selectedId ?? ""}
        className="border-2 border-gray-400 rounded-lg px-4 py-3 text-xl bg-white focus:outline-none focus:border-blue-600"
      >
        <option value="" disabled>
          시니어를 선택하세요
        </option>
        {seniors.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.region} · {s.desired_job})
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white text-xl font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        매칭 조회
      </button>
    </form>
  );
}
