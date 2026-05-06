"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { calculateScore } from "@/lib/matching";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type RegisterState = { error: string } | null;

export async function registerSenior(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get("name") as string)?.trim();
  const region = (formData.get("region") as string)?.trim();
  const desired_job = (formData.get("desired_job") as string)?.trim();
  const career_years = parseInt(formData.get("career_years") as string, 10);

  if (!name || !region || !desired_job || isNaN(career_years)) {
    return { error: "모든 항목을 빠짐없이 입력해 주세요." };
  }

  const supabase = db();

  const { data: senior, error: seniorErr } = await supabase
    .from("seniors")
    .insert({ name, region, desired_job, career_years })
    .select()
    .single();

  if (seniorErr || !senior) {
    return { error: "등록 중 오류가 발생했습니다. 다시 시도해 주세요." };
  }

  // 모든 일자리와 매칭 점수 계산
  const { data: jobs } = await supabase.from("jobs").select("*");

  if (jobs && jobs.length > 0) {
    const rows = jobs
      .map((job) => ({
        senior_id: senior.id,
        job_id: job.id,
        score: calculateScore(senior, job),
        status: "unmatched",
      }))
      .filter((r) => r.score > 0);   // 0점 제외

    if (rows.length > 0) {
      await supabase.from("matches").insert(rows);
    }
  }

  revalidatePath("/recommendations");
  revalidatePath("/admin");
  redirect(`/recommendations?senior_id=${senior.id}`);
}
