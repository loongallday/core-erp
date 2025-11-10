-- Add localization support to users table

-- Add locale and timezone columns
ALTER TABLE users
ADD COLUMN locale VARCHAR(10) DEFAULT 'en' NOT NULL,
ADD COLUMN timezone VARCHAR(100) DEFAULT 'Asia/Bangkok' NOT NULL;

-- Add check constraint for supported locales
ALTER TABLE users
ADD CONSTRAINT users_locale_check CHECK (locale IN ('en', 'th'));

-- Create index for performance
CREATE INDEX idx_users_locale ON users(locale);

-- Add comment for documentation
COMMENT ON COLUMN users.locale IS 'User preferred language (en=English, th=Thai)';
COMMENT ON COLUMN users.timezone IS 'User timezone for date/time formatting';

