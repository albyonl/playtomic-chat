import { AxiosRequestConfig } from 'axios';
import { Auth } from 'firebase/auth';
import { Database } from 'firebase/database';
import { Address as Address$1 } from 'cluster';

type Result<T> = T;
interface PlaytomicClientOpts {
    baseURL?: string;
    email: string;
    password: string;
}
interface PlaytomicHttpClient {
    get: <T = unknown>(url: string, cfg?: AxiosRequestConfig) => Promise<T>;
    post: <T = unknown>(url: string, body?: any, cfg?: AxiosRequestConfig) => Promise<T>;
    patch: <T = unknown>(url: string, body?: any, cfg?: AxiosRequestConfig) => Promise<T>;
    logout: () => Promise<void>;
}
interface PlaytomicChatClient {
    ensureSignedIn: () => Promise<void>;
    auth: Auth;
    database: Database;
}
type Playtomic = PlaytomicHttpClient & PlaytomicChatClient;

declare const playtomic: (opts: PlaytomicClientOpts) => Playtomic;

/**
 * gets the thread id from a user
 */
declare const getUserThread: (client: PlaytomicHttpClient, userId: string) => Promise<string>;
/**
 * gets the thread id from a user
 */
declare const getMatchThread: (client: PlaytomicHttpClient, matchId: string) => Promise<string>;
/**
 * sends message to a thread
 */
declare const sendMessage: (client: PlaytomicChatClient, text: string, threadId: string) => Promise<string>;

interface TournamentRegistration {
    user_id: string;
    payment_id: string;
    registration_price: string;
    payment_method_type: string;
    full_name: string;
    level_value: number;
    picture: string;
    paid_at_merchant: boolean;
    payment_b2b_billing_type: string;
}
interface ClassRegistration {
    player: {
        user_id: string;
        name: string;
        communications_language: string;
        is_premium: boolean;
    };
    price: string;
    registration_date: string;
    custom_price: string;
    is_manual_price: boolean;
    is_fixed_price: boolean;
}

interface Resource {
    resource_id: string;
    name: string;
    description: string;
    sport_id: string;
    reservation_priority: number;
    is_active: boolean;
    merchant_resource_id: string | null;
    properties: Record<string, string>;
    booking_settings: {
        start_time_policy: string;
        allowed_duration_increments: number[];
        is_bookable_online: boolean;
        allows_onsite_payment: boolean;
        shared_resources: any[];
    };
}

interface Tenant {
    tenant_id: string;
    tenant_uid: string;
    tenant_name: string;
    tenant_type: string;
    tenant_status: string;
    address: Address$1;
    resources: Resource[];
    properties: Record<string, string>;
    images: string[];
    image_data: {
        url: string;
        image_id: string;
        client_type: "WEB" | "MOBILE";
    }[];
    booking_type: string;
    playtomic_status: string;
    is_playtomic_partner: boolean;
    default_cancelation_policy: {
        amount: number;
        unit: string;
    };
    opening_hours: Record<"SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY", {
        opening_time: string;
        closing_time: string;
    }>;
    communications_language: string;
    onboarding_status: string;
    booking_settings: {
        booking_ahead_limit: number;
        max_consecutive_bookable_time: number;
        max_bookable_time_per_day: number;
        max_number_of_active_bookings: number;
        max_number_of_bookings_per_day: number;
    };
    created_at: number;
    slug: string;
    sport_ids: string[];
    tenant_hostname: string;
    cancellation_policies: {
        sport_id: string;
        duration: {
            amount: number;
            unit: string;
        };
        sport_ids: string;
    }[];
}
/**
 * tenant defined inside an academy class object
 */
interface ClassTenant {
    tenant_id: string;
    tenant_name: string;
    address: Address$1;
    images: string[];
    properties: Record<string, string>;
    playtomic_status: string;
    cancellation_policies: {
        sport_id: string;
        duration: {
            amount: number;
            unit: string;
        };
        sport_ids: string;
    }[];
}

type Class = {
    type: string;
    academy_class_id: string;
    sport_id: string;
    tenant: ClassTenant;
    resource: Resource;
    start_date: string;
    end_date: string;
    coaches: {
        user_id: string;
        lock_id: string;
        name: string;
        picture: string;
        level_value: number;
        level_value_confidence: number;
        communications_language: string;
        is_premium: boolean;
        coach_id: string;
    }[];
    registration_info: {
        payment_type: string;
        number_of_players: number;
        base_price: string;
        price: string;
        is_manual_price: boolean;
        registrations: ClassRegistration[];
        online_payment_allowed: boolean;
        restrictions_configuration?: any;
        custom_price_configurations?: any;
    };
    origin: string;
    is_canceled: boolean;
    public_notes: string;
    resources: Resource[];
    payment_status: string;
    status: string;
};

/**
 * gets all classes
 */
declare const getClasses: (client: PlaytomicHttpClient, opts?: {
    from?: Date;
    until?: Date;
    tenantId?: string;
}) => Promise<Class[]>;
/**
 * gets a class by its id
 */
declare const getClassById: (client: PlaytomicHttpClient, classId: string) => Promise<Class[]>;

/**
 * gets all tenants
 * you can filter down with coordinates
 */
declare const getTenants: (client: PlaytomicHttpClient, opts?: {
    coordinates?: {
        lat: number | string;
        lon: number | string;
    };
    radius?: string | number;
}) => Promise<Tenant[]>;
/**
 * gets a tenant (club) by its id
 */
declare const getTenantById: (client: PlaytomicHttpClient, tenantId: string) => Promise<Tenant>;

/**
 * gets all tournaments
 */
declare const getTournaments: (client: PlaytomicHttpClient, opts?: {
    from?: Date;
    until?: Date;
    tenantId?: string;
}) => Promise<Class[]>;
/**
 * gets a class by its id
 */
declare const getTournamentById: (client: PlaytomicHttpClient, tournamentId: string) => Promise<Class[]>;

type UserPrivacy = "PUBLIC" | "PRIVATE" | string;
type UserStatus = "ONLINE" | "OFFLINE" | string;
interface User {
    user_id: string;
    full_name: string;
    picture: string | null;
    is_validated: boolean;
    is_email_verified: boolean;
    is_phone_verified: boolean;
    bio: string;
    communications_language: string;
    country_code: string;
    email: string | null;
    phone: string | null;
    facebook_id: string | null;
    privacy_profile: UserPrivacy;
    is_premium: boolean;
    tenant_tags: string[];
}

interface Me extends User {
    is_deleted: boolean;
    accepts_privacy: boolean;
    accepts_commercial: boolean;
    linked_accounts: any[];
    organization_linked_accounts: any[];
    coach_accounts: any[];
    tenant_owner_accounts: any[];
    birth_date: string | null;
    gender: string | null;
    user_roles: {
        user_role: string;
        tenant_id: string;
        scope_id: string;
    }[];
    active_permissions: any | null;
    created_by_user: string | null;
    created_by_tenant: string | null;
    created_by_organization: string | null;
    subscription_id: string | null;
    type: UserStatus;
}

declare function getMe(client: PlaytomicHttpClient): Promise<Me>;
declare function getUser(client: PlaytomicHttpClient, id: string): Promise<User | null>;

interface Tournament {
    tournament_id: string;
    tournament_name: string;
    tournament_image: string | null;
    start_date: string;
    end_date: string;
    type: string;
    min_players: number;
    max_players: number;
    registered_players: TournamentRegistration[];
}

interface Address {
    street: string;
    postal_code: string;
    city: string;
    sub_administrative_area?: string;
    administrative_area: string;
    country: string;
    country_code: string;
    coordinate: {
        lat: number;
        lon: number;
    };
    timezone: string;
}

export { Address, Class, ClassRegistration, Me, Playtomic, PlaytomicChatClient, PlaytomicClientOpts, PlaytomicHttpClient, Resource, Result, Tournament, TournamentRegistration, User, UserPrivacy, UserStatus, getClassById, getClasses, getMatchThread, getMe, getTenantById, getTenants, getTournamentById, getTournaments, getUser, getUserThread, playtomic, sendMessage };
