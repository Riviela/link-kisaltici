alter function public.rls_auto_enable() set search_path = pg_catalog;

revoke all on function public.rls_auto_enable() from public;
revoke all on function public.rls_auto_enable() from anon, authenticated, service_role;
