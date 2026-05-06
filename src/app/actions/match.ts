"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { MatchStatus } from "@/types";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  const supabase = db();
  const { error } = await supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId);

  if (error) return { error: "상태 업데이트에 실패했습니다." };

  revalidatePath("/admin");
  revalidatePath("/recommendations");
  return { success: true };
}
