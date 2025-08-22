export type UserPrivacy = "PUBLIC" | "PRIVATE" | string;
export type UserStatus = "ONLINE" | "OFFLINE" | string;

export interface User {
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
