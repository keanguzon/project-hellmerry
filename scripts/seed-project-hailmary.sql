CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.seed_project_hailmary_for_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.books (user_id, book_title, pdf_url, cover_url, bookmarked_page)
  SELECT
    p_user_id,
    'Project Hail Mary',
    '/project-hailmary-book/phm-book.pdf',
    '/project-hailmary-book/cover.jpg',
    0
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.books b
    WHERE b.user_id = p_user_id
      AND b.pdf_url = '/project-hailmary-book/phm-book.pdf'
  );
END;
$$;

CREATE OR REPLACE FUNCTION private.handle_new_auth_user_seed_project_hailmary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  PERFORM private.seed_project_hailmary_for_user(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_seed_project_hailmary ON auth.users;
CREATE TRIGGER on_auth_user_created_seed_project_hailmary
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_auth_user_seed_project_hailmary();

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  FOR v_user_id IN SELECT id FROM auth.users LOOP
    PERFORM private.seed_project_hailmary_for_user(v_user_id);
  END LOOP;
END;
$$;
