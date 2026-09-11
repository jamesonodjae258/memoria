-- Add contact email field to funeral_homes
-- This is the email address families will see and reply to
-- Separate from the owner's login/account email
ALTER TABLE funeral_homes
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_email_verified BOOLEAN DEFAULT false;

COMMENT ON COLUMN funeral_homes.contact_email IS 'Public-facing email shown to families as reply-to on all outbound communications';
