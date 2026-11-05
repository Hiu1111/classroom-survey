
-- Classroom Survey Web App
-- Database schema, RLS policies, and RPC functions
-- PostgreSQL / Supabase
--
-- This migration is intended for a NEW Supabase project.
-- Do not run it again on the existing project because
-- the database tables have already been created.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. DATABASE TABLES
-- ============================================

CREATE TABLE public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    public_slug TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one survey can be active
CREATE UNIQUE INDEX one_active_survey
ON public.surveys (status)
WHERE status = 'active';

CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL
        REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL
        CHECK (question_type IN ('multiple_choice', 'true_false')),
    position INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE public.choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL
        REFERENCES public.questions(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL
        REFERENCES public.surveys(id) ON DELETE CASCADE,
    anonymous_token TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (survey_id, anonymous_token)
);

CREATE TABLE public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL
        REFERENCES public.responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL
        REFERENCES public.questions(id) ON DELETE CASCADE,
    choice_id UUID
        REFERENCES public.choices(id) ON DELETE SET NULL,
    text_answer TEXT,
    UNIQUE (response_id, question_id)
);

-- ============================================
-- 2. DATABASE INDEXES
-- ============================================

CREATE INDEX idx_questions_survey
ON public.questions(survey_id);

CREATE INDEX idx_choices_question
ON public.choices(question_id);

CREATE INDEX idx_responses_survey
ON public.responses(survey_id);

CREATE INDEX idx_answers_response
ON public.answers(response_id);

-- ============================================
-- 3. INSTRUCTOR AUTHORIZATION
-- ============================================

CREATE SCHEMA IF NOT EXISTS app_private;

REVOKE ALL ON SCHEMA app_private
FROM PUBLIC, anon, authenticated;

CREATE TABLE app_private.instructors (
    user_id UUID PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE
);

-- After creating an instructor user in Supabase Auth,
-- register that user by running the following SQL
-- separately in the Supabase SQL Editor:
--
-- INSERT INTO app_private.instructors(user_id)
-- VALUES ('YOUR_INSTRUCTOR_AUTH_USER_UID')
-- ON CONFLICT (user_id) DO NOTHING;

CREATE FUNCTION public.is_instructor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM app_private.instructors
        WHERE user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_instructor()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_instructor()
TO authenticated;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized instructors manage surveys"
ON public.surveys
FOR ALL TO authenticated
USING ((SELECT public.is_instructor()))
WITH CHECK ((SELECT public.is_instructor()));

CREATE POLICY "Authorized instructors manage questions"
ON public.questions
FOR ALL TO authenticated
USING ((SELECT public.is_instructor()))
WITH CHECK ((SELECT public.is_instructor()));

CREATE POLICY "Authorized instructors manage choices"
ON public.choices
FOR ALL TO authenticated
USING ((SELECT public.is_instructor()))
WITH CHECK ((SELECT public.is_instructor()));

CREATE POLICY "Authorized instructors manage responses"
ON public.responses
FOR ALL TO authenticated
USING ((SELECT public.is_instructor()))
WITH CHECK ((SELECT public.is_instructor()));

CREATE POLICY "Authorized instructors manage answers"
ON public.answers
FOR ALL TO authenticated
USING ((SELECT public.is_instructor()))
WITH CHECK ((SELECT public.is_instructor()));

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.surveys,
   public.questions,
   public.choices,
   public.responses,
   public.answers
TO authenticated;

-- Anonymous users must use RPC functions.
-- They cannot access the underlying tables directly.
REVOKE ALL
ON public.surveys,
   public.questions,
   public.choices,
   public.responses,
   public.answers
FROM anon;

-- ============================================
-- 5. PUBLIC SURVEY LOOKUP
-- ============================================

CREATE FUNCTION public.get_public_survey(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_survey public.surveys%ROWTYPE;
BEGIN
    SELECT *
    INTO v_survey
    FROM public.surveys
    WHERE public_slug = p_slug;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('status', 'not_found');
    END IF;

    IF v_survey.status <> 'active' THEN
        RETURN jsonb_build_object('status', 'closed');
    END IF;

    RETURN jsonb_build_object(
        'status', 'active',
        'survey', jsonb_build_object(
            'id', v_survey.id,
            'title', v_survey.title,
            'description', v_survey.description
        ),
        'questions', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', q.id,
                    'question_text', q.question_text,
                    'question_type', q.question_type,
                    'position', q.position,
                    'choices', COALESCE((
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', c.id,
                                'choice_text', c.choice_text,
                                'position', c.position
                            )
                            ORDER BY c.position
                        )
                        FROM public.choices c
                        WHERE c.question_id = q.id
                    ), '[]'::jsonb)
                )
                ORDER BY q.position
            )
            FROM public.questions q
            WHERE q.survey_id = v_survey.id
        ), '[]'::jsonb)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_survey(TEXT)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_public_survey(TEXT)
TO anon, authenticated;

-- ============================================
-- 6. ANONYMOUS RESPONSE SUBMISSION
-- ============================================

CREATE FUNCTION public.submit_survey_response(
    p_survey_id UUID,
    p_anonymous_token TEXT,
    p_answers JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_response_id UUID;
    v_answer JSONB;
    v_question_id UUID;
    v_choice_id UUID;
    v_question_count INTEGER;
    v_seen UUID[] := ARRAY[]::UUID[];
BEGIN
    IF p_anonymous_token IS NULL
       OR length(p_anonymous_token) NOT BETWEEN 16 AND 256 THEN
        RAISE EXCEPTION 'Invalid anonymous token';
    END IF;

    IF p_answers IS NULL
       OR jsonb_typeof(p_answers) <> 'array' THEN
        RAISE EXCEPTION 'Invalid answers';
    END IF;

    PERFORM 1
    FROM public.surveys
    WHERE id = p_survey_id
      AND status = 'active'
    FOR SHARE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Survey is not active';
    END IF;

    SELECT count(*)
    INTO v_question_count
    FROM public.questions
    WHERE survey_id = p_survey_id;

    IF v_question_count = 0
       OR jsonb_array_length(p_answers) <> v_question_count THEN
        RAISE EXCEPTION 'All questions must be answered';
    END IF;

    FOR v_answer IN
        SELECT value FROM jsonb_array_elements(p_answers)
    LOOP
        IF jsonb_typeof(v_answer) <> 'object'
           OR (v_answer->>'question_id') IS NULL
           OR (v_answer->>'choice_id') IS NULL THEN
            RAISE EXCEPTION 'Invalid answer';
        END IF;

        BEGIN
            v_question_id := (v_answer->>'question_id')::UUID;
            v_choice_id := (v_answer->>'choice_id')::UUID;
        EXCEPTION WHEN invalid_text_representation THEN
            RAISE EXCEPTION 'Invalid question or choice ID';
        END;

        IF v_question_id = ANY(v_seen) THEN
            RAISE EXCEPTION 'Duplicate question';
        END IF;

        v_seen := array_append(v_seen, v_question_id);

        PERFORM 1
        FROM public.questions q
        JOIN public.choices c
            ON c.question_id = q.id
        WHERE q.id = v_question_id
          AND q.survey_id = p_survey_id
          AND c.id = v_choice_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid answer choice';
        END IF;
    END LOOP;

    IF EXISTS (
        SELECT 1
        FROM public.responses
        WHERE survey_id = p_survey_id
          AND anonymous_token = p_anonymous_token
    ) THEN
        RAISE EXCEPTION 'DUPLICATE_RESPONSE';
    END IF;

    INSERT INTO public.responses (
        survey_id,
        anonymous_token
    )
    VALUES (
        p_survey_id,
        p_anonymous_token
    )
    RETURNING id INTO v_response_id;

    FOR v_answer IN
        SELECT value FROM jsonb_array_elements(p_answers)
    LOOP
        INSERT INTO public.answers (
            response_id,
            question_id,
            choice_id
        )
        VALUES (
            v_response_id,
            (v_answer->>'question_id')::UUID,
            (v_answer->>'choice_id')::UUID
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'response_id', v_response_id
    );

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'DUPLICATE_RESPONSE';
END;
$$;

REVOKE ALL ON FUNCTION public.submit_survey_response(
    UUID, TEXT, JSONB
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_survey_response(
    UUID, TEXT, JSONB
) TO anon, authenticated;

-- ============================================
-- 7. SURVEY ACTIVATION
-- ============================================

CREATE FUNCTION public.activate_survey(p_survey_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_survey public.surveys%ROWTYPE;
    v_slug TEXT;
BEGIN
    IF NOT public.is_instructor() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(20261105);

    SELECT *
    INTO v_survey
    FROM public.surveys
    WHERE id = p_survey_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Survey not found';
    END IF;

    IF v_survey.status = 'archived' THEN
        RAISE EXCEPTION 'Archived surveys cannot be activated';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.questions
        WHERE survey_id = p_survey_id
    ) THEN
        RAISE EXCEPTION 'Survey needs at least one question';
    END IF;

    v_slug := COALESCE(
        v_survey.public_slug,
        substring(
            replace(gen_random_uuid()::TEXT, '-', '')
            FROM 1 FOR 12
        )
    );

    UPDATE public.surveys
    SET status = 'closed',
        updated_at = NOW()
    WHERE status = 'active'
      AND id <> p_survey_id;

    UPDATE public.surveys
    SET status = 'active',
        public_slug = v_slug,
        updated_at = NOW()
    WHERE id = p_survey_id;

    RETURN jsonb_build_object(
        'id', p_survey_id,
        'status', 'active',
        'public_slug', v_slug
    );
END;
$$;

REVOKE ALL ON FUNCTION public.activate_survey(UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.activate_survey(UUID)
TO authenticated;

-- ============================================
-- 8. CLOSE SURVEY
-- ============================================

CREATE FUNCTION public.close_survey(p_survey_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_instructor() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    UPDATE public.surveys
    SET status = 'closed',
        updated_at = NOW()
    WHERE id = p_survey_id
      AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Survey is not active';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.close_survey(UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.close_survey(UUID)
TO authenticated;

-- End of Classroom Survey database migration
