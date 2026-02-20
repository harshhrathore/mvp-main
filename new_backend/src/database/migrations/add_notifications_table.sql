-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    is_read BOOLEAN DEFAULT false,
    data JSONB, -- For deep links or extra metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimize for fetching unread notifications per user
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Comment
COMMENT ON TABLE notifications IS 'User-specific in-app notifications';
