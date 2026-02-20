/**
 * Blog System Types
 */

export interface BlogPost {
    post_id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author_id?: string;
    category: 'Breathwork' | 'Sleep' | 'Routines' | 'Mindset' | 'Yoga' | 'Ayurveda' | 'Nutrition';
    tags?: string[];
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    meta_description?: string;
    meta_keywords?: string[];
    featured_image_url?: string;
    image_alt_text?: string;
    read_time_minutes?: number;
    views_count: number;
    likes_count: number;
    published_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface BlogTakeaway {
    takeaway_id: string;
    post_id: string;
    takeaway_text: string;
    display_order: number;
    created_at: Date;
}

export interface BlogEngagement {
    engagement_id: string;
    post_id: string;
    user_id: string;
    viewed: boolean;
    view_duration_seconds?: number;
    liked: boolean;
    bookmarked: boolean;
    first_viewed_at?: Date;
    last_viewed_at?: Date;
    created_at: Date;
}

export interface CreateBlogPostDto {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags?: string[];
    featured?: boolean;
    meta_description?: string;
    featured_image_url?: string;
    image_alt_text?: string;
    read_time_minutes?: number;
    takeaways?: string[];
}

/**
 * Contact System Types
 */

export interface ContactSubmission {
    submission_id: string;
    user_id?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    subject: string;
    message: string;
    category: 'general' | 'technical' | 'billing' | 'feedback' | 'bug_report' | 'feature_request' | 'other';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    user_agent?: string;
    ip_address?: string;
    referring_url?: string;
    status: 'new' | 'in_progress' | 'waiting_reply' | 'resolved' | 'closed';
    assigned_to?: string;
    response_text?: string;
    responded_at?: Date;
    responded_by?: string;
    created_at: Date;
    updated_at: Date;
    resolved_at?: Date;
}

export interface CreateContactSubmissionDto {
    subject: string;
    message: string;
    category: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
}

/**
 * Newsletter System Types
 */

export interface NewsletterSubscriber {
    subscriber_id: string;
    email: string;
    user_id?: string;
    full_name?: string;
    interests?: string[];
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    status: 'pending' | 'active' | 'unsubscribed' | 'bounced';
    confirmed: boolean;
    confirmation_token?: string;
    confirmation_sent_at?: Date;
    confirmed_at?: Date;
    emails_sent: number;
    emails_opened: number;
    last_email_sent_at?: Date;
    last_email_opened_at?: Date;
    unsubscribed_at?: Date;
    unsubscribe_reason?: string;
    subscribed_at: Date;
    created_at: Date;
    updated_at: Date;
}

export interface CreateNewsletterSubscriptionDto {
    email: string;
    full_name?: string;
    interests?: string[];
}

export interface NewsletterCampaign {
    campaign_id: string;
    title: string;
    subject_line: string;
    preview_text?: string;
    html_content: string;
    text_content?: string;
    target_audience: string;
    custom_filter?: any;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduled_at?: Date;
    sent_at?: Date;
    recipients_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    unsubscribed_count: number;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
}

/**
 * Profile System Types
 */

export interface UserProfile {
    profile_id: string;
    user_id: string;
    bio?: string;
    profile_photo_url?: string;
    cover_photo_url?: string;
    height_cm?: number;
    weight_kg?: number;
    occupation?: string;
    timezone: string;
    primary_goal?: string;
    secondary_goals?: string[];
    target_practices?: string[];
    profile_visibility: 'public' | 'private' | 'friends';
    show_progress: boolean;
    show_streak: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UpdateProfileDto {
    bio?: string;
    profile_photo_url?: string;
    cover_photo_url?: string;
    height_cm?: number;
    weight_kg?: number;
    occupation?: string;
    timezone?: string;
    primary_goal?: string;
    secondary_goals?: string[];
    target_practices?: string[];
    profile_visibility?: 'public' | 'private' | 'friends';
    show_progress?: boolean;
    show_streak?: boolean;
}

export interface ProfileActivityLog {
    activity_id: string;
    user_id: string;
    activity_type: string;
    activity_data?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}
