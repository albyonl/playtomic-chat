import { Address } from "cluster";
import { Resource } from "./resource.types.js";


export interface Tenant {
    
  tenant_id: string;
  tenant_uid: string;
  tenant_name: string;
  tenant_type: string;
  tenant_status: string;

  address: Address;
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

  opening_hours: Record<
    | "SUNDAY"
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY",
    { opening_time: string; closing_time: string }
  >;

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
 * tenant defined inside a tournament object
 */
export interface TournamentTenant {
  tenant_id: string;
  tenant_name: string;
  tenant_address: Address;
  tenant_images: string[];
  properties: Record<string, string>;
}

/**
 * tenant defined inside an academy class object
 */
export interface ClassTenant {
  tenant_id: string;
  tenant_name: string;
  address: Address;
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
