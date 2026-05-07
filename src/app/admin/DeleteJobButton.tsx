"use client";

import { useTransition } from "react";
import { deleteJob } from "@/app/actions/job";

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteJob(jobId);
        })
      }
      className="text-base font-semibold px-3 py-1.5 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors"
    >
      {isPending ? "삭제 중…" : "삭제"}
    </button>
  );
}
