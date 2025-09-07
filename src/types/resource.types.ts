export interface Resource {
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
