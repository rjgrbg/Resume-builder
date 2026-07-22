-- Resumes: one row per uploaded Resume_File
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  status text not null default 'uploaded' check (status in ('uploaded','parsing','parsed','parse_failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.resumes is 'Uploaded Resume_File metadata (Requirement 1).';

create index resumes_user_id_idx on public.resumes(user_id);

alter table public.resumes enable row level security;

create policy "resumes_select_own" on public.resumes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "resumes_insert_own" on public.resumes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "resumes_update_own" on public.resumes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "resumes_delete_own" on public.resumes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Resume_Document: Original or Enhanced structured content for a resume
create table public.resume_documents (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('original','enhanced')),
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resume_id, kind)
);

comment on table public.resume_documents is 'Original_Resume / Enhanced_Resume structured content (Requirements 2,4,5).';

create index resume_documents_user_id_idx on public.resume_documents(user_id);
create index resume_documents_resume_id_idx on public.resume_documents(resume_id);

alter table public.resume_documents enable row level security;

create policy "resume_documents_select_own" on public.resume_documents
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "resume_documents_insert_own" on public.resume_documents
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "resume_documents_update_own" on public.resume_documents
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "resume_documents_delete_own" on public.resume_documents
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Evaluations: ATS_Score + Evaluation_Report per Resume_Document
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  resume_document_id uuid not null references public.resume_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  report jsonb not null,
  created_at timestamptz not null default now(),
  unique (resume_document_id)
);

comment on table public.evaluations is 'ATS_Score + Evaluation_Report for a Resume_Document (Requirement 3).';

create index evaluations_user_id_idx on public.evaluations(user_id);
create index evaluations_resume_document_id_idx on public.evaluations(resume_document_id);

alter table public.evaluations enable row level security;

create policy "evaluations_select_own" on public.evaluations
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "evaluations_insert_own" on public.evaluations
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "evaluations_update_own" on public.evaluations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "evaluations_delete_own" on public.evaluations
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

create trigger resume_documents_set_updated_at
  before update on public.resume_documents
  for each row execute function public.set_updated_at();
;
