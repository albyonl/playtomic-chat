interface Tournament {
  tournament_id: string;
  tournament_name: string;
  tournament_image: string | null;
  start_date: string; // ISO 8601 date string
  end_date: string; // ISO 8601 date string
  type: string;
  min_players: number;
  max_players: number;
  registered_players: number;
}

interface TournamentPlayer {
  user_id: string;
  payment_id: string;
  registration_price: string;
  payment_method_type: string;
  full_name: string;
  level_value: number;
  picture: string;
  paid_at_merchant: boolean;
};
