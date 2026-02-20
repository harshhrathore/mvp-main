CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15),
    full_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    country VARCHAR(2) DEFAULT 'IN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted'))
);

-- Authentication details
CREATE TABLE user_authentication (
    auth_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255),
    google_id VARCHAR(100) UNIQUE,
    apple_id VARCHAR(100) UNIQUE,
    last_login_at TIMESTAMP,
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    UNIQUE(user_id)
);

-- Onboarding progress
CREATE TABLE user_onboarding (
    onboarding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_1_completed BOOLEAN DEFAULT false,  -- Health check (5 questions)
    step_2_completed BOOLEAN DEFAULT false,  -- First conversation
    step_3_completed BOOLEAN DEFAULT false,  -- Dosha quiz
    health_baseline JSONB,  -- {sleep: 7, energy: 5, appetite: 8, pain: 2, medications: []}
    onboarding_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);


-- Dosha assessments (quiz results)
CREATE TABLE dosha_assessment (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(20) DEFAULT 'initial' CHECK (assessment_type IN ('initial', 'quarterly', 'ad_hoc')),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Question data
    questions_version VARCHAR(10) DEFAULT 'v1.0',
    responses JSONB NOT NULL,  -- All 15 questions + answers
    response_times JSONB,  -- For research
    
    -- Calculation results
    prakriti_scores JSONB NOT NULL,  -- {vata: 0.65, pitta: 0.25, kapha: 0.10}
    primary_dosha VARCHAR(10) NOT NULL,
    secondary_dosha VARCHAR(10),
    confidence_score DECIMAL(3,2),
    
    -- Research metadata
    research_sources TEXT,
    algorithm_version VARCHAR(10) DEFAULT 'tier-weighted',
    expert_validated BOOLEAN DEFAULT false
);

-- Daily dosha tracking (imbalance monitoring)
CREATE TABLE dosha_tracking (
    tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Current state (vikriti)
    vikriti_scores JSONB,  -- {vata: 0.75, pitta: 0.20, kapha: 0.05}
    dominant_imbalance VARCHAR(10),
    imbalance_intensity INT CHECK (imbalance_intensity BETWEEN 1 AND 10),
    
    -- Emotion mapping
    detected_emotion VARCHAR(50),
    emotion_to_dosha_mapping JSONB,
    
    -- Trends
    weekly_balance_score INT,
    monthly_trend VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);


-- Chat sessions
CREATE TABLE conversation_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'regular' CHECK (session_type IN ('first_chat', 'regular', 'crisis', 'checkin')),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INT,
    device_info JSONB,  -- {model: "iPhone 13", os: "iOS 16.5"}
    network_type VARCHAR(10),
    location_city VARCHAR(50)
);

-- Individual messages within sessions
CREATE TABLE conversation_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_number INT NOT NULL,
    
    -- User's message
    input_type VARCHAR(10) CHECK (input_type IN ('voice', 'text')),
    audio_file_url TEXT,
    audio_duration_seconds INT,
    transcript_text TEXT,
    transcript_confidence DECIMAL(3,2),
    
    -- AI's response
    ai_response_text TEXT,
    ai_response_audio_url TEXT,
    response_emotion_tone VARCHAR(20),
    background_sound VARCHAR(50),
    
    -- Context
    time_of_day VARCHAR(20),
    detected_context VARCHAR(50),
    previous_topic VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE emotion_analysis (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES conversation_messages(message_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- BERT 28 emotion results
    primary_emotion VARCHAR(50) NOT NULL,
    primary_confidence DECIMAL(3,2) NOT NULL,
    all_emotions JSONB NOT NULL,  -- All 28 emotions with probabilities
    emotion_intensity INT CHECK (emotion_intensity BETWEEN 1 AND 10),
    
    -- Ayurvedic mapping
    vata_impact_score DECIMAL(3,2),
    pitta_impact_score DECIMAL(3,2),
    kapha_impact_score DECIMAL(3,2),
    recommended_dosha_focus VARCHAR(10),
    
    -- Model metadata
    bert_model_version VARCHAR(20),
    processing_time_ms INT,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Unified content store (practices, herbs, lifestyle tips)
CREATE TABLE ayurveda_knowledge (
    knowledge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('breathing', 'yoga', 'diet', 'herb', 'lifestyle', 'mantra')),
    title VARCHAR(200) NOT NULL,
    description_short TEXT,
    description_detailed TEXT,
    
    -- Ayurvedic properties
    balances_doshas TEXT[],  -- ['Vata', 'Pitta']
    aggravates_doshas TEXT[],
    best_for_season VARCHAR(20),
    best_time_of_day VARCHAR(20),
    
    -- Emotional benefits
    helps_with_emotions TEXT[],  -- ['anxiety', 'stress', 'anger']
    not_recommended_for TEXT[],
    emotional_intensity VARCHAR(10),
    
    -- Practical details
    duration_minutes INT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    equipment_needed VARCHAR(50),
    location VARCHAR(50),
    
    -- Instructions
    steps JSONB,  -- [{step: 1, instruction: "Sit comfortably..."}]
    precautions TEXT[],
    video_url TEXT,
    audio_guide_url TEXT,
    
    -- Research & effectiveness
    traditional_source VARCHAR(100),
    research_studies TEXT[],
    user_success_rate DECIMAL(3,2) DEFAULT 0.0,
    times_recommended INT DEFAULT 0,
    avg_effectiveness_rating DECIMAL(2,1) DEFAULT 0.0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags for RAG optimization
CREATE TABLE knowledge_tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_id UUID NOT NULL REFERENCES ayurveda_knowledge(knowledge_id) ON DELETE CASCADE,
    tag_type VARCHAR(20) CHECK (tag_type IN ('dosha', 'emotion', 'duration', 'difficulty', 'season')),
    tag_value VARCHAR(50) NOT NULL,
    relevance_score DECIMAL(3,2) DEFAULT 1.0
);


-- Safety monitoring for crisis detection
CREATE TABLE safety_monitoring (
    safety_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES conversation_messages(message_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Detection
    trigger_type VARCHAR(20) CHECK (trigger_type IN ('keywords', 'bert_pattern', 'both')),
    detected_keywords TEXT[],
    crisis_level VARCHAR(20) CHECK (crisis_level IN ('low', 'medium', 'high', 'critical')),
    confidence_score DECIMAL(3,2),
    
    -- Action taken
    protocol_activated BOOLEAN DEFAULT false,
    protocol_name VARCHAR(50),
    ai_response_modified BOOLEAN DEFAULT false,
    helpline_suggested BOOLEAN DEFAULT false,
    
    -- Follow-up
    followup_required BOOLEAN DEFAULT false,
    followup_scheduled TIMESTAMP,
    followup_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpline referrals
CREATE TABLE helpline_referrals (
    referral_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    safety_id UUID NOT NULL REFERENCES safety_monitoring(safety_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Referral details
    helpline_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    contact_method VARCHAR(20),
    operating_hours VARCHAR(50),
    languages TEXT[],
    
    -- User action
    suggested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_acknowledged BOOLEAN DEFAULT false,
    user_contacted BOOLEAN DEFAULT false,
    contact_timestamp TIMESTAMP,
    outcome_notes TEXT
);


-- User preferences
CREATE TABLE user_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Voice settings
    voice_gender VARCHAR(10) DEFAULT 'female',
    speaking_speed VARCHAR(10) DEFAULT 'normal',
    background_sounds BOOLEAN DEFAULT true,
    preferred_language VARCHAR(10) DEFAULT 'English',
    
    -- Notification settings
    morning_reminder BOOLEAN DEFAULT true,
    evening_checkin BOOLEAN DEFAULT true,
    weekly_insights BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '07:00:00',
    
    -- Content preferences
    favorite_practices UUID[],
    disliked_practices UUID[],
    learning_level VARCHAR(20) DEFAULT 'beginner',
    
    -- Privacy
    data_for_research BOOLEAN DEFAULT false,
    anonymized_data BOOLEAN DEFAULT true,
    delete_after_inactive VARCHAR(20) DEFAULT '1year',
    
    UNIQUE(user_id)
);

-- Recommendation history
CREATE TABLE recommendation_history (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES conversation_sessions(session_id) ON DELETE SET NULL,
    knowledge_id UUID REFERENCES ayurveda_knowledge(knowledge_id) ON DELETE CASCADE,
    
    -- Recommendation context
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason JSONB,  -- {emotion: "anxiety", dosha: "vata", context: "morning"}
    priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
    ai_explanation TEXT,
    
    -- User response
    presented_to_user BOOLEAN DEFAULT false,
    user_accepted BOOLEAN DEFAULT false,
    saved_for_later BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false,
    
    -- Completion tracking
    attempted BOOLEAN DEFAULT false,
    completed BOOLEAN DEFAULT false,
    completion_timestamp TIMESTAMP,
    effectiveness_rating INT CHECK (effectiveness_rating BETWEEN 1 AND 5),
    feedback_notes TEXT
);



-- Daily progress tracking
CREATE TABLE user_progress_daily (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Emotional health
    avg_emotion_score INT,
    emotion_stability INT,
    primary_emotion_day VARCHAR(50),
    mood_swings_count INT DEFAULT 0,
    
    -- Ayurvedic balance
    dosha_balance_score INT,
    dominant_imbalance VARCHAR(10),
    imbalance_intensity INT,
    
    -- Engagement
    conversations_count INT DEFAULT 0,
    total_chat_minutes INT DEFAULT 0,
    practices_completed INT DEFAULT 0,
    app_opens_count INT DEFAULT 0,
    
    -- Self-reported
    sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
    energy_levels INT CHECK (energy_levels BETWEEN 1 AND 10),
    stress_level INT CHECK (stress_level BETWEEN 1 AND 10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Weekly insights
CREATE TABLE user_insights_weekly (
    insight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    
    -- Patterns
    emotion_pattern VARCHAR(100),
    dosha_pattern VARCHAR(100),
    trigger_patterns TEXT[],
    
    -- Progress
    week_over_week_change DECIMAL(5,2),  -- Percentage
    consistency_score INT CHECK (consistency_score BETWEEN 0 AND 100),
    breakthrough_moments JSONB,
    
    -- Recommendations
    most_effective_practice UUID REFERENCES ayurveda_knowledge(knowledge_id),
    practice_completion_rate DECIMAL(5,2),
    suggested_focus_next_week VARCHAR(10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

-- User streaks (for gamification)
CREATE TABLE user_streaks (
    streak_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE,
    UNIQUE(user_id)
);


-- App configuration
CREATE TABLE app_configuration (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    environment VARCHAR(20) DEFAULT 'production',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Error logs
CREATE TABLE error_logs (
    error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(50),
    error_message TEXT,
    stack_trace TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(200),
    request_body JSONB,
    device_info JSONB,
    app_version VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false
);

-- API usage metrics
CREATE TABLE api_usage_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_provider VARCHAR(50),
    endpoint_used VARCHAR(200),
    tokens_used INT,
    characters_processed INT,
    cost_incurred DECIMAL(10,4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL
);


-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(account_status) WHERE account_status = 'active';
CREATE INDEX idx_user_auth_google ON user_authentication(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_user_auth_apple ON user_authentication(apple_id) WHERE apple_id IS NOT NULL;

-- Conversation queries
CREATE INDEX idx_conv_sessions_user ON conversation_sessions(user_id, start_time DESC);
CREATE INDEX idx_conv_messages_session ON conversation_messages(session_id, sequence_number);
CREATE INDEX idx_conv_messages_user ON conversation_messages(user_id, created_at DESC);

-- Emotion analysis
CREATE INDEX idx_emotion_user ON emotion_analysis(user_id, analysis_timestamp DESC);
CREATE INDEX idx_emotion_message ON emotion_analysis(message_id);

-- Dosha tracking
CREATE INDEX idx_dosha_assessment_user ON dosha_assessment(user_id, completed_at DESC);
CREATE INDEX idx_dosha_tracking_user_date ON dosha_tracking(user_id, date DESC);

-- Knowledge & recommendations
CREATE INDEX idx_knowledge_type ON ayurveda_knowledge(content_type);
CREATE INDEX idx_knowledge_tags_type_value ON knowledge_tags(tag_type, tag_value);
CREATE INDEX idx_recommendation_user ON recommendation_history(user_id, recommended_at DESC);

-- Safety monitoring
CREATE INDEX idx_safety_user ON safety_monitoring(user_id, created_at DESC);
CREATE INDEX idx_safety_crisis_level ON safety_monitoring(crisis_level) WHERE crisis_level IN ('high', 'critical');

-- Progress tracking
CREATE INDEX idx_progress_user_date ON user_progress_daily(user_id, date DESC);
CREATE INDEX idx_insights_user_week ON user_insights_weekly(user_id, week_start_date DESC);

-- Error logs
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved) WHERE resolved = false;


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ayurveda_knowledge_updated_at BEFORE UPDATE ON ayurveda_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- User overview
CREATE VIEW user_overview AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.created_at,
    uo.step_3_completed as onboarding_complete,
    da.primary_dosha,
    us.current_streak,
    COUNT(DISTINCT cs.session_id) as total_sessions
FROM users u
LEFT JOIN user_onboarding uo ON u.id = uo.user_id
LEFT JOIN dosha_assessment da ON u.id = da.user_id
LEFT JOIN user_streaks us ON u.id = us.user_id
LEFT JOIN conversation_sessions cs ON u.id = cs.user_id
WHERE u.account_status = 'active'
GROUP BY u.id, u.email, u.full_name, u.created_at, uo.step_3_completed, da.primary_dosha, us.current_streak;

-- Recent conversations
CREATE VIEW recent_conversations AS
SELECT 
    cm.message_id,
    cm.session_id,
    cm.user_id,
    u.full_name,
    cm.transcript_text,
    cm.ai_response_text,
    ea.primary_emotion,
    ea.primary_confidence,
    cm.created_at
FROM conversation_messages cm
JOIN users u ON cm.user_id = u.id
LEFT JOIN emotion_analysis ea ON cm.message_id = ea.message_id
ORDER BY cm.created_at DESC;



COMMENT ON TABLE users IS 'Core user accounts';
COMMENT ON TABLE conversation_messages IS 'All chat messages with voice/text data';
COMMENT ON TABLE emotion_analysis IS 'BERT model output for emotion detection';
COMMENT ON TABLE ayurveda_knowledge IS 'RAG-ready knowledge base for recommendations';
COMMENT ON TABLE safety_monitoring IS 'Crisis detection and safety protocols';

-- Push Notifications Subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_secret TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
