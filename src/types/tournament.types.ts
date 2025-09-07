import { TournamentRegistration } from "./registration.types.js";

export interface Tournament {
  tournament_id: string;
  tournament_name: string;
  tournament_image: string | null;
  start_date: string; 
  end_date: string; 
  type: string;
  min_players: number;
  max_players: number;
  registered_players: TournamentRegistration[]
}
