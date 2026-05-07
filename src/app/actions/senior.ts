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

export type FieldErrors = Partial<Record<"name" | "region" | "desired_job", string>>;

export type RegisterState =
  | { success: true }
  | { error: string; fields: FieldErrors }
  | null;

export async function registerSenior(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const region = (formData.get("region") as string)?.trim() ?? "";
  const desired_job = (formData.get("desired_job") as string)?.trim() ?? "";
  const career_years = parseInt((formData.get("career_years") as string) ?? "0", 10);

  // 필드별 유효성 검사
  const fields: FieldErrors = {};
  if (!name) fields.name = "이름을 입력해 주세요.";
  if (!region) fields.region = "지역을 선택해 주세요.";
  if (!desired_job) fields.desired_job = "희망 직종을 선택해 주세요.";

  if (Object.keys(fields).length > 0) {
    return { error: "필수 항목을 확인해 주세요.", fields };
  }

  const supabase = db();

  const { data: senior, error: seniorErr } = await supabase
    .from("seniors")
    .insert({
      name,
      region,
      desired_job,
      career_years: isNaN(career_years) ? 0 : career_years,
    })
    .select()
    .single();

  if (seniorErr || !senior) {
    return { error: "등록 중 오류가 발생했습니다. 다시 시도해 주세요.", fields: {} };
  }

  // 기존 매칭 로직 유지
  const { data: jobs } = await supabase.from("jobs").select("*");
  if (jobs && jobs.length > 0) {
    const rows = jobs
      .map((job) => ({
        senior_id: senior.id,
        job_id: job.id,
        score: calculateScore(senior, job),
        status: "unmatched",
      }))
      .filter((r) => r.score > 0);

    if (rows.length > 0) {
      await supabase.from("matches").insert(rows);
    }
  }

  revalidatePath("/recommendations");
  revalidatePath("/admin");
  return { success: true };
}
