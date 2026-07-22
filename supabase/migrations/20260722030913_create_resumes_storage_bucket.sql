insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

-- Users may only access objects under a path prefixed with their own uid, e.g. `${uid}/${resumeId}/${filename}`
create policy "resumes_storage_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "resumes_storage_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "resumes_storage_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1])
  with check (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "resumes_storage_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);
;
