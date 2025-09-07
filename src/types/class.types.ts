import { ClassRegistration } from "./registration.types.js";
import { Resource } from "./resource.types.js";
import { ClassTenant } from "./tenant.type.js";

export type Class = {
  type: string;
  academy_class_id: string;
  sport_id: string; 
  tenant: ClassTenant;
  resource: Resource;
  start_date: string; // ISO timestamp
  end_date: string;   // ISO timestamp
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
