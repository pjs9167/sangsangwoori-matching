"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

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

  if (!title || !region || !job_type) {
    return { error: "공고명, 지역, 직종은 필수입니다." };
  }

  const supabase = db();
  const { error } = await supabase.from("jobs").insert({
    title,
    region,
    job_type,
    required_career: isNaN(required_career) ? 0 : required_career,
  });

  if (error) return { error: "일자리 등록에 실패했습니다." };

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteJob(jobId: string) {
  const supabase = db();
  // matches.job_id 에 ON DELETE CASCADE 설정돼 있어 별도 삭제 불필요
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) return { error: "삭제에 실패했습니다." };
  revalidatePath("/admin");
  return { success: true };
}
