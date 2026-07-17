-- Custom SQL migration file, put your code below! --
-- Resolve the application role from the server-owned profiles table.
-- SECURITY DEFINER prevents recursive profile RLS checks while auth.uid()
-- still binds the result to the authenticated Supabase user.
CREATE OR REPLACE FUNCTION public.has_app_role(allowed_roles public.user_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND status = 'active'
      AND role = ANY (allowed_roles)
  );
$$;

REVOKE ALL ON FUNCTION public.has_app_role(public.user_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_app_role(public.user_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_app_role(public.user_role[]) TO service_role;

-- A signed-in user may read only their own profile. Role/status changes remain
-- server-controlled; only super_admin receives a database policy for all rows.
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_super_admin_all"
ON public.profiles FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role]));

-- Public configuration needed to render the website.
CREATE POLICY "site_settings_public_select"
ON public.site_settings FOR SELECT TO anon, authenticated
USING (settings_key = 'default');

CREATE POLICY "social_links_public_select"
ON public.social_links FOR SELECT TO anon, authenticated
USING (enabled = true);

CREATE POLICY "categories_public_select"
ON public.categories FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "tags_public_select"
ON public.tags FOR SELECT TO anon, authenticated
USING (true);

-- Public content is read-only and limited to published, non-deleted rows.
CREATE POLICY "posts_public_select_published"
ON public.posts FOR SELECT TO anon, authenticated
USING (
  status = 'published'
  AND published_at <= now()
  AND deleted_at IS NULL
);

CREATE POLICY "post_tags_public_select_published"
ON public.post_tags FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.posts
    WHERE posts.id = post_tags.post_id
      AND posts.status = 'published'
      AND posts.published_at <= now()
      AND posts.deleted_at IS NULL
  )
);

CREATE POLICY "videos_public_select_published"
ON public.videos FOR SELECT TO anon, authenticated
USING (
  content_status = 'published'
  AND (published_at IS NULL OR published_at <= now())
  AND deleted_at IS NULL
  AND (platform <> 'internal' OR processing_status = 'ready')
);

CREATE POLICY "gallery_public_select_published"
ON public.gallery_items FOR SELECT TO anon, authenticated
USING (
  status = 'published'
  AND (published_at IS NULL OR published_at <= now())
  AND deleted_at IS NULL
);

CREATE POLICY "events_public_select_published"
ON public.events FOR SELECT TO anon, authenticated
USING (content_status = 'published' AND deleted_at IS NULL);

CREATE POLICY "campaigns_public_select_visible"
ON public.campaigns FOR SELECT TO anon, authenticated
USING (status IN ('upcoming', 'active', 'ended') AND deleted_at IS NULL);

-- Content roles. Application Server Actions must still call
-- requirePermission(); these policies are defense in depth for the Data API.
CREATE POLICY "categories_content_roles_all"
ON public.categories FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "tags_content_roles_all"
ON public.tags FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "posts_content_roles_all"
ON public.posts FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "post_tags_content_roles_all"
ON public.post_tags FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "media_assets_content_roles_all"
ON public.media_assets FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "videos_content_roles_all"
ON public.videos FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "gallery_content_roles_all"
ON public.gallery_items FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "events_content_roles_all"
ON public.events FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

CREATE POLICY "campaigns_content_roles_all"
ON public.campaigns FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role, 'editor'::public.user_role]));

-- Site settings are writable by super_admin/admin only.
CREATE POLICY "site_settings_admin_all"
ON public.site_settings FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "social_links_admin_all"
ON public.social_links FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

-- Submission rows never receive anon/authenticated INSERT policies. Future
-- public forms must insert through a validated and rate-limited backend.
CREATE POLICY "campaign_submissions_admin_select"
ON public.campaign_submissions FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "campaign_submissions_admin_update"
ON public.campaign_submissions FOR UPDATE TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "contact_submissions_admin_select"
ON public.contact_submissions FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "contact_submissions_admin_update"
ON public.contact_submissions FOR UPDATE TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "newsletter_subscriptions_admin_select"
ON public.newsletter_subscriptions FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "newsletter_subscriptions_admin_update"
ON public.newsletter_subscriptions FOR UPDATE TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "analytics_events_admin_select"
ON public.analytics_events FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "audit_logs_admin_select"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));
