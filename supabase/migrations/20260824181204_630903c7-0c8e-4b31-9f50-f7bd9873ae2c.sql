-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- settings (single row)
CREATE TABLE public.invite_settings (
  id text PRIMARY KEY DEFAULT 'default',
  question_single text NOT NULL DEFAULT 'Are you single? ❤️',
  question_free text NOT NULL DEFAULT 'Are you free? 👀',
  yes_label text NOT NULL DEFAULT 'Yes ❤️',
  no_label_single text NOT NULL DEFAULT 'No 😏',
  no_label_free text NOT NULL DEFAULT 'No 😌',
  no_message_single text NOT NULL DEFAULT 'Hmm... I think you need to think about that one again 😏',
  no_message_free text NOT NULL DEFAULT 'Aww... I''ll wait for you 🥺❤️',
  date_title text NOT NULL DEFAULT 'When are you free for me? 🥰',
  confirmation_message text NOT NULL DEFAULT 'Yay! It''s a date! ❤️',
  welcome_title text NOT NULL DEFAULT 'Hey you 💕',
  welcome_subtitle text NOT NULL DEFAULT 'I made something just for you. Promise it''ll only take a minute.',
  cta_label text NOT NULL DEFAULT 'Let''s see 👀',
  date_selection_enabled boolean NOT NULL DEFAULT true,
  min_date date NOT NULL DEFAULT CURRENT_DATE,
  max_date date NOT NULL DEFAULT (CURRENT_DATE + 60),
  allow_single_date boolean NOT NULL DEFAULT true,
  allow_date_range boolean NOT NULL DEFAULT true,
  blocked_dates date[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.invite_settings TO anon;
GRANT SELECT ON public.invite_settings TO authenticated;
GRANT ALL ON public.invite_settings TO service_role;
ALTER TABLE public.invite_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read invite settings" ON public.invite_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update invite settings" ON public.invite_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert invite settings" ON public.invite_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER invite_settings_updated_at BEFORE UPDATE ON public.invite_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.invite_settings (id) VALUES ('default');

-- responses
CREATE TABLE public.invite_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_single boolean NOT NULL DEFAULT true,
  is_free boolean NOT NULL DEFAULT true,
  selected_date date,
  range_start date,
  range_end date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.invite_responses TO anon;
GRANT INSERT ON public.invite_responses TO authenticated;
GRANT SELECT ON public.invite_responses TO authenticated;
GRANT ALL ON public.invite_responses TO service_role;
ALTER TABLE public.invite_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a response" ON public.invite_responses
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read responses" ON public.invite_responses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));