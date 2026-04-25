export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type SharedNotification = {
    id: number;
    type: string;
    title: string;
    message: string;
    event_id: number | null;
    read_at: string | null;
    created_at: string | null;
};

export type SharedNotifications = {
    unread_count: number;
    items: SharedNotification[];
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
