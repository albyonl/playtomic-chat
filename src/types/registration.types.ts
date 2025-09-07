export interface TournamentRegistration {
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

export interface ClassRegistration {
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
