-- Defense in depth: browser-authenticated editors may inspect media metadata,
-- but all mutations must flow through permission-checked server services.
DROP POLICY IF EXISTS "media_assets_content_roles_all" ON public.media_assets;

CREATE POLICY "media_assets_admin_all"
ON public.media_assets FOR ALL TO authenticated
USING (public.has_app_role(ARRAY[
  'super_admin'::public.user_role,
  'admin'::public.user_role
]))
WITH CHECK (public.has_app_role(ARRAY[
  'super_admin'::public.user_role,
  'admin'::public.user_role
]));

CREATE POLICY "media_assets_editor_select"
ON public.media_assets FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['editor'::public.user_role]));
