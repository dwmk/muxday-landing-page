-- Security Audit Table
CREATE TABLE public.security_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL, -- e.g., 'login', 'post_created', 'repost'
  ip_address text,
  user_agent text,
  device_fingerprint text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT security_audit_logs_pkey PRIMARY KEY (id)
);

-- Indexing for fast lookups by law enforcement or admins
CREATE INDEX idx_audit_user ON public.security_audit_logs(user_id);
CREATE INDEX idx_audit_ip ON public.security_audit_logs(ip_address);
CREATE INDEX idx_audit_fingerprint ON public.security_audit_logs(device_fingerprint);

-- Enable RLS (Security)
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow the system to insert, nobody (not even the user) to read/delete
CREATE POLICY "System can insert logs" ON public.security_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Strict Privacy: Logs are invisible" ON public.security_audit_logs FOR SELECT USING (false);

-- 1. Expand Security Audit Logs for Forensic Data
ALTER TABLE public.security_audit_logs 
ADD COLUMN isp text,
ADD COLUMN country_code text,
ADD COLUMN canvas_hash text,
ADD COLUMN gpu_info text;

-- 2. Create a high-priority 'incident_reports' table
-- This is for specifically tracking illegal content cases with evidentiary notes
CREATE TABLE public.incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid REFERENCES auth.users(id),
  incident_type text NOT NULL, -- e.g., 'CSAM', 'Violence'
  evidence_links jsonb, -- URLs to the content/posts
  associated_ips text[],
  associated_fingerprints text[],
  status text DEFAULT 'pending_review',
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create a 'banned_identifiers' table
-- Block by IP, Canvas Hash, or GPU signature to stop ban evasion
CREATE TABLE public.banned_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_value text UNIQUE NOT NULL, -- Can be an IP or a CanvasHash
  identifier_type text NOT NULL, -- 'ip', 'canvas', 'gpu'
  reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexing for fast lookups during login/posting
CREATE INDEX idx_security_logs_canvas ON public.security_audit_logs(canvas_hash);
CREATE INDEX idx_security_logs_ip ON public.security_audit_logs(ip_address);

-- Add hash columns to track content DNA
ALTER TABLE public.posts ADD COLUMN media_hash text;
ALTER TABLE public.forum_posts ADD COLUMN media_hash text;
ALTER TABLE public.messages ADD COLUMN media_hash text;

-- Index for instant lookup during upload
CREATE INDEX idx_posts_media_hash ON public.posts(media_hash);