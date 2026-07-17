-- Keep database authorization aligned with the application permission matrix:
-- editors may view all content and write drafts, but only admin roles may
-- publish, archive, or otherwise mutate non-draft content.

DROP POLICY IF EXISTS "posts_content_roles_all" ON public.posts;
DROP POLICY IF EXISTS "videos_content_roles_all" ON public.videos;
DROP POLICY IF EXISTS "gallery_content_roles_all" ON public.gallery_items;
DROP POLICY IF EXISTS "events_content_roles_all" ON public.events;
DROP POLICY IF EXISTS "campaigns_content_roles_all" ON public.campaigns;

CREATE POLICY "posts_admin_all"
ON public.posts FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "posts_editor_select"
ON public.posts FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "posts_editor_insert_draft"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
);

CREATE POLICY "posts_editor_update_draft"
ON public.posts FOR UPDATE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
)
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
);

CREATE POLICY "videos_admin_all"
ON public.videos FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "videos_editor_select"
ON public.videos FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "videos_editor_insert_draft"
ON public.videos FOR INSERT TO authenticated
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND content_status = 'draft'
);

CREATE POLICY "videos_editor_update_draft"
ON public.videos FOR UPDATE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND content_status = 'draft'
)
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND content_status = 'draft'
);

CREATE POLICY "gallery_admin_all"
ON public.gallery_items FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "gallery_editor_select"
ON public.gallery_items FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "gallery_editor_insert_draft"
ON public.gallery_items FOR INSERT TO authenticated
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
);

CREATE POLICY "gallery_editor_update_draft"
ON public.gallery_items FOR UPDATE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
)
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
);

CREATE POLICY "events_admin_all"
ON public.events FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "events_editor_select"
ON public.events FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "events_editor_insert_draft"
ON public.events FOR INSERT TO authenticated
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND content_status = 'draft'
);

CREATE POLICY "events_editor_update_draft"
ON public.events FOR UPDATE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND content_status = 'draft'
)
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND content_status = 'draft'
);

CREATE POLICY "campaigns_admin_all"
ON public.campaigns FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "campaigns_editor_select"
ON public.campaigns FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "campaigns_editor_insert_draft"
ON public.campaigns FOR INSERT TO authenticated
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
);

CREATE POLICY "campaigns_editor_update_draft"
ON public.campaigns FOR UPDATE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
)
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND status = 'draft'
);
