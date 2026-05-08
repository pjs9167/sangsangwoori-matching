import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key);
}

export async function resetDb() {
  const db = getClient();
  // 외래키 참조 순서: matches → seniors → jobs
  await db.from("matches").delete().not("id", "is", null);
  await db.from("seniors").delete().not("id", "is", null);
  await db.from("jobs").delete().not("id", "is", null);
}

export async function insertJob(data: {
  title: string;
  region: string;
  job_type: string;
  required_career: number;
}) {
  const db = getClient();
  const { data: job, error } = await db
    .from("jobs")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`jobs insert 실패: ${error.message}`);
  return job as { id: string };
}

export async function getLatestSenior() {
  const db = getClient();
  const { data, error } = await db
    .from("seniors")
    .select("id, name")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error) throw new Error(`seniors 조회 실패: ${error.message}`);
  return data as { id: string; name: string };
}

export async function countSeniors(): Promise<number> {
  const db = getClient();
  const { count, error } = await db
    .from("seniors")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`seniors count 실패: ${error.message}`);
  return count ?? 0;
}
