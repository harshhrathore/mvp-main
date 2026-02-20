CREATE TABLE blog_posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Breathwork', 'Sleep', 'Routines', 'Mindset', 'Yoga', 'Ayurveda', 'Nutrition')),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT false,
    meta_description TEXT,
    meta_keywords TEXT[],
    featured_image_url TEXT,
    image_alt_text VARCHAR(200),
    read_time_minutes INT,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_takeaways (
    takeaway_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(post_id) ON DELETE CASCADE,
    takeaway_text TEXT NOT NULL,
    display_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_engagement (
    engagement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(post_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed BOOLEAN DEFAULT false,
    view_duration_seconds INT,
    liked BOOLEAN DEFAULT false,
    bookmarked BOOLEAN DEFAULT false,
    first_viewed_at TIMESTAMP,
    last_viewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

CREATE TABLE contact_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contact_name VARCHAR(100),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(15),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('general', 'technical', 'billing', 'feedback', 'bug_report', 'feature_request', 'other')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    user_agent TEXT,
    ip_address VARCHAR(50),
    referring_url TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_reply', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    response_text TEXT,
    responded_at TIMESTAMP,
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE contact_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES contact_submissions(submission_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INT,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletter_subscribers (
    subscriber_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(100),
    interests TEXT[],
    frequency VARCHAR(20) DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced')),
    confirmed BOOLEAN DEFAULT false,
    confirmation_token VARCHAR(100) UNIQUE,
    confirmation_sent_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    emails_sent INT DEFAULT 0,
    emails_opened INT DEFAULT 0,
    last_email_sent_at TIMESTAMP,
    last_email_opened_at TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    unsubscribe_reason TEXT,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletter_campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    subject_line VARCHAR(200) NOT NULL,
    preview_text VARCHAR(150),
    html_content TEXT NOT NULL,
    text_content TEXT,
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'active_users', 'new_users', 'custom')),
    custom_filter JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    recipients_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    opened_count INT DEFAULT 0,
    clicked_count INT DEFAULT 0,
    bounced_count INT DEFAULT 0,
    unsubscribed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE newsletter_engagement (
    engagement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES newsletter_campaigns(campaign_id) ON DELETE CASCADE,
    subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(subscriber_id) ON DELETE CASCADE,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    bounced BOOLEAN DEFAULT false,
    bounce_reason TEXT,
    opened BOOLEAN DEFAULT false,
    first_opened_at TIMESTAMP,
    open_count INT DEFAULT 0,
    last_opened_at TIMESTAMP,
    clicked BOOLEAN DEFAULT false,
    click_count INT DEFAULT 0,
    clicked_links TEXT[],
    unsubscribed BOOLEAN DEFAULT false,
    unsubscribed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, subscriber_id)
);

CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    profile_photo_url TEXT,
    cover_photo_url TEXT,
    height_cm INT,
    weight_kg DECIMAL(5,2),
    occupation VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    primary_goal VARCHAR(100),
    secondary_goals TEXT[],
    target_practices TEXT[],
    profile_visibility VARCHAR(20) DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    show_progress BOOLEAN DEFAULT false,
    show_streak BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profile_activity_log (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO ayurveda_knowledge (content_type, title, description_short, description_detailed, balances_doshas, best_time_of_day, helps_with_emotions, duration_minutes, difficulty, steps, precautions)
VALUES 
('yoga', 'Child''s Pose (Balasana)', 'A grounding pose to release tension and calm the mind', 
 'Balasana is a resting yoga pose that helps ground the body and calm the nervous system. Perfect for reducing stress and anxiety.',
 ARRAY['Vata'], 'evening', ARRAY['anxiety', 'stress', 'fatigue'], 2, 'beginner',
 '{"steps": [{"step": 1, "instruction": "Kneel on the floor with big toes touching"}, {"step": 2, "instruction": "Sit back on heels and spread knees apart"}, {"step": 3, "instruction": "Fold forward, extending arms in front"}, {"step": 4, "instruction": "Rest forehead on mat and breathe deeply"}]}'::jsonb,
 ARRAY['Avoid if you have knee injuries', 'Use props for comfort']
),
('yoga', 'Mountain Pose (Tadasana)', 'A foundational standing pose for grounding and alignment',
 'Tadasana is the foundation of all standing poses. It improves posture, balance, and calm awareness.',
 ARRAY['Vata'], 'morning', ARRAY['anxiety', 'fatigue'], 2, 'beginner',
 '{"steps": [{"step": 1, "instruction": "Stand with feet hip-width apart"}, {"step": 2, "instruction": "Distribute weight evenly on both feet"}, {"step": 3, "instruction": "Lift through the crown of head"}, {"step": 4, "instruction": "Relax shoulders and breathe"}]}'::jsonb,
 ARRAY['Maintain natural spine alignment']
),
('yoga', 'Downward Facing Dog (Adho Mukha Svanasana)', 'An energizing inversion that strengthens and stretches',
 'This pose energizes the body while calming the mind. Great for Kapha types needing activation.',
 ARRAY['Kapha'], 'morning', ARRAY['fatigue', 'low energy'], 3, 'intermediate',
 '{"steps": [{"step": 1, "instruction": "Start on hands and knees"}, {"step": 2, "instruction": "Tuck toes and lift hips up and back"}, {"step": 3, "instruction": "Press hands firmly into mat"}, {"step": 4, "instruction": "Relax head between arms"}]}'::jsonb,
 ARRAY['Avoid if you have wrist or shoulder injuries', 'Modify by bending knees']
),
('yoga', 'Corpse Pose (Savasana)', 'Deep relaxation pose for integration and rest',
 'Savasana promotes complete relaxation and is especially beneficial for Pitta types to release heat and tension.',
 ARRAY['Pitta'], 'evening', ARRAY['stress', 'anger', 'tension'], 5, 'beginner',
 '{"steps": [{"step": 1, "instruction": "Lie flat on your back"}, {"step": 2, "instruction": "Let legs fall open naturally"}, {"step": 3, "instruction": "Arms at sides, palms up"}, {"step": 4, "instruction": "Close eyes and breathe naturally"}]}'::jsonb,
 ARRAY['Use blanket for comfort', 'Cover eyes to deepen relaxation']
);

-- Add breathing exercises
INSERT INTO ayurveda_knowledge (content_type, title, description_short, description_detailed, balances_doshas, best_time_of_day, helps_with_emotions, duration_minutes, difficulty, steps, precautions)
VALUES
('breathing', 'Alternate Nostril Breathing (Nadi Shodhana)', 'Balancing breath to calm nervous system',
 'This classic pranayama technique balances the left and right energy channels, calming Vata and promoting mental clarity.',
 ARRAY['Vata'], 'anytime', ARRAY['anxiety', 'stress', 'restlessness'], 5, 'beginner',
 '{"steps": [{"step": 1, "instruction": "Sit comfortably with spine straight"}, {"step": 2, "instruction": "Close right nostril with thumb"}, {"step": 3, "instruction": "Inhale through left nostril"}, {"step": 4, "instruction": "Close left, exhale through right"}, {"step": 5, "instruction": "Continue alternating"}]}'::jsonb,
 ARRAY['Breathe gently, never force', 'Stop if you feel dizzy']
),
('breathing', '4-7-8 Breathing', 'Relaxing breath for sleep and anxiety',
 'A simple yet powerful technique to reduce anxiety and promote sleep. Excellent for Vata and Pitta imbalances.',
 ARRAY['Vata', 'Pitta'], 'evening', ARRAY['anxiety', 'insomnia', 'stress'], 3, 'beginner',
 '{"steps": [{"step": 1, "instruction": "Exhale completely through mouth"}, {"step": 2, "instruction": "Inhale through nose for 4 counts"}, {"step": 3, "instruction": "Hold breath for 7 counts"}, {"step": 4, "instruction": "Exhale through mouth for 8 counts"}, {"step": 5, "instruction": "Repeat 4 times"}]}'::jsonb,
 ARRAY['Start with shorter counts if needed', 'Avoid if you have breathing conditions']
),
('breathing', 'Box Breathing', 'Square breathing for focus and calm',
 'Equal-ratio breathing that enhances focus and reduces stress. Beneficial for all doshas.',
 ARRAY['Vata', 'Pitta', 'Kapha'], 'anytime', ARRAY['stress', 'anxiety', 'lack of focus'], 5, 'beginner',
 '{"steps": [{"step": 1, "instruction": "Inhale for 4 counts"}, {"step": 2, "instruction": "Hold for 4 counts"}, {"step": 3, "instruction": "Exhale for 4 counts"}, {"step": 4, "instruction": "Hold empty for 4 counts"}, {"step": 5, "instruction": "Repeat cycle"}]}'::jsonb,
 ARRAY['Keep breath smooth and comfortable', 'Adjust counts as needed']
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Blog indexes
CREATE INDEX idx_blog_posts_status ON blog_posts(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_engagement_user ON blog_engagement(user_id, post_id);

-- Contact indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status, created_at DESC);
CREATE INDEX idx_contact_submissions_user ON contact_submissions(user_id);
CREATE INDEX idx_contact_submissions_category ON contact_submissions(category);

-- Newsletter indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status) WHERE status = 'active';
CREATE INDEX idx_newsletter_campaigns_status ON newsletter_campaigns(status, scheduled_at);
CREATE INDEX idx_newsletter_engagement_campaign ON newsletter_engagement(campaign_id, subscriber_id);

-- Profile indexes
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_profile_activity_user ON profile_activity_log(user_id, created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at BEFORE UPDATE ON newsletter_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE blog_posts IS 'Blog articles and wellness content';
COMMENT ON TABLE contact_submissions IS 'User contact form submissions and support tickets';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscription management';
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
