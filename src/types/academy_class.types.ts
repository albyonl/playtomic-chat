type AcademyClass = {
  type: string;
  academy_class_id: string;
  sport_id: string; 
  tenant: {
    tenant_id: string;
    tenant_name: string;
    address: {
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
    };
    images: string[];
    properties: Record<string, any>;
    playtomic_status: string;
    cancelation_policies: any[];
  };
  resource: {
    id: string;
    lock_id: string;
    name: string;
    properties: {
      resource_type: "indoor" | "outdoor";
      resource_size: "single" | "double";
      resource_feature?: string;
    };
  };
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
    payment_type: "SPLIT" | "FULL" | "FREE";
    number_of_players: number;
    base_price: string;
    price: string;
    is_manual_price: boolean;
    registrations: {
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
    }[];
    online_payment_allowed: boolean;
    restrictions_configuration?: any;
    custom_price_configurations?: any;
  };
  origin: "MANAGER" | "PLAYER" | "SYSTEM";
  is_canceled: boolean;
  public_notes: string;
  resources: {
    id: string;
    lock_id: string;
    name: string;
    properties: {
      resource_type: "indoor" | "outdoor";
      resource_size: "single" | "double";
      resource_feature?: string;
    };
  }[];
  payment_status: "PAID" | "UNPAID" | "PARTIALLY_PAID";
  status: "PLANNED" | "ONGOING" | "FINISHED" | "CANCELED";
};
