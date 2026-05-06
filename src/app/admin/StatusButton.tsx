"use client";

import { useTransition } from "react";
import { updateMatchStatus } from "@/app/actions/match";
import type { MatchStatus } from "@/types";

export function StatusButton({
  matchId,
  nextStatus,
  label,
}: {
  matchId: string;
  nextStatus: MatchStatus;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await updateMatchStatus(matchId, nextStatus);
        })
      }
      className="text-base font-semibold px-3 py-1.5 rounded-lg border-2 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition-colors"
    >
      {isPending ? "처리 중…" : label}
    </button>
  );
}
