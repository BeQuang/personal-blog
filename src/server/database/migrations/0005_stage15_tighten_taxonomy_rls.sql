-- Keep taxonomy and post-tag mutations aligned with the application
-- permission matrix. Editors may manage draft content, but changes that
-- affect scheduled, published, or archived posts require an admin role.

DROP POLICY IF EXISTS "categories_content_roles_all" ON public.categories;
DROP POLICY IF EXISTS "tags_content_roles_all" ON public.tags;
DROP POLICY IF EXISTS "post_tags_content_roles_all" ON public.post_tags;

CREATE POLICY "categories_admin_all"
ON public.categories FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "categories_editor_insert"
ON public.categories FOR INSERT TO authenticated
WITH CHECK (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "categories_editor_update_draft_only"
ON public.categories FOR UPDATE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND NOT EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.category_id = categories.id
      AND posts.status <> 'draft'
      AND posts.deleted_at IS NULL
  )
)
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND NOT EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.category_id = categories.id
      AND posts.status <> 'draft'
      AND posts.deleted_at IS NULL
  )
);

CREATE POLICY "categories_editor_delete_draft_only"
ON public.categories FOR DELETE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND NOT EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.category_id = categories.id
      AND posts.status <> 'draft'
      AND posts.deleted_at IS NULL
  )
);

CREATE POLICY "tags_admin_all"
ON public.tags FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "tags_editor_insert"
ON public.tags FOR INSERT TO authenticated
WITH CHECK (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "tags_editor_update_draft_only"
ON public.tags FOR UPDATE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND NOT EXISTS (
    SELECT 1
    FROM public.post_tags
    INNER JOIN public.posts ON posts.id = post_tags.post_id
    WHERE post_tags.tag_id = tags.id
      AND posts.status <> 'draft'
      AND posts.deleted_at IS NULL
  )
)
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND NOT EXISTS (
    SELECT 1
    FROM public.post_tags
    INNER JOIN public.posts ON posts.id = post_tags.post_id
    WHERE post_tags.tag_id = tags.id
      AND posts.status <> 'draft'
      AND posts.deleted_at IS NULL
  )
);

CREATE POLICY "tags_editor_delete_draft_only"
ON public.tags FOR DELETE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND NOT EXISTS (
    SELECT 1
    FROM public.post_tags
    INNER JOIN public.posts ON posts.id = post_tags.post_id
    WHERE post_tags.tag_id = tags.id
      AND posts.status <> 'draft'
      AND posts.deleted_at IS NULL
  )
);

CREATE POLICY "post_tags_admin_all"
ON public.post_tags FOR ALL TO authenticated
USING (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]))
WITH CHECK (public.has_app_role(ARRAY['super_admin'::public.user_role, 'admin'::public.user_role]));

CREATE POLICY "post_tags_editor_select"
ON public.post_tags FOR SELECT TO authenticated
USING (public.has_app_role(ARRAY['editor'::public.user_role]));

CREATE POLICY "post_tags_editor_insert_draft_only"
ON public.post_tags FOR INSERT TO authenticated
WITH CHECK (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_tags.post_id
      AND posts.status = 'draft'
      AND posts.deleted_at IS NULL
  )
);

CREATE POLICY "post_tags_editor_delete_draft_only"
ON public.post_tags FOR DELETE TO authenticated
USING (
  public.has_app_role(ARRAY['editor'::public.user_role])
  AND EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_tags.post_id
      AND posts.status = 'draft'
      AND posts.deleted_at IS NULL
  )
);
