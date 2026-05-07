"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { calculateScore } from "@/lib/matching";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type AddJobState = { success: true } | { error: string } | null;

export async function addJob(
  _prev: AddJobState,
  formData: FormData
): Promise<AddJobState> {
  const title = (formData.get("title") as string)?.trim() ?? "";
  const region = (formData.get("region") as string)?.trim() ?? "";
  const job_type = (formData.get("job_type") as string)?.trim() ?? "";
  const required_career = parseInt((formData.get("required_career") as string) ?? "0", 10);

  if (!title || !region || !job_type) return { error: "공고명, 지역, 직종은 필수입니다." };

  const supabase = db();

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({ title, region, job_type, required_career: isNaN(required_career) ? 0 : required_career })
    .select()
    .single();

  if (jobErr || !job) return { error: "일자리 등록에 실패했습니다." };

  // RPC 호출 → 실패 시 앱 레이어 폴백 (트리거 대신 앱 레이어에서 재계산)
  const { error: rpcErr } = await supabase.rpc("match_job_to_seniors", {
    p_job_id: job.id,
  });

  if (rpcErr) {
    // 폴백: 앱 레이어에서 직접 계산
    const { data: seniors } = await supabase.from("seniors").select("*");
    if (seniors && seniors.length > 0) {
      const rows = seniors
        .map((s) => ({ senior_id: s.id, job_id: job.id, score: calculateScore(s, job), status: "pending" }))
        .filter((r) => r.score > 0);
      if (rows.length > 0) {
        await supabase.from("matches").upsert(rows, { onConflict: "senior_id,job_id", ignoreDuplicates: false });
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/recommendations");
  return { success: true };
}

export async function deleteJob(jobId: string) {
  const supabase = db();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) return { error: "삭제에 실패했습니다." };
  revalidatePath("/admin");
  return { success: true };
}
