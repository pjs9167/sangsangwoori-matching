export type Senior = {
  id: string;
  name: string;
  region: string;
  desired_job: string;
  career_years: number;
  created_at: string;
};

export type Job = {
  id: string;
  title: string;
  region: string;
  job_type: string;
  required_career: number;
  created_at: string;
};

export type MatchStatus = "unmatched" | "pending" | "assigned";

export type Match = {
  id: string;
  senior_id: string;
  job_id: string;
  score: number;
  status: MatchStatus;
  created_at: string;
};

export type MatchWithJob = Match & { jobs: Job };
export type MatchWithAll = Match & { jobs: Job; seniors: Senior };
