import { Class } from "@/types/class.types.js";

import { PlaytomicHttpClient } from "@/types/client.types.js";

/**
 * gets all tournaments
 */
export const getTournaments = async (
  client: PlaytomicHttpClient,
  opts?: {
    from?: Date;
    until?: Date;
    tenantId?: string;
  }
): Promise<Class[]> => {
  try {
    const tournaments = await client.get<Class[]>(`/v1/tournaments`, {
      params: {
        ...(opts?.tenantId && { tenant_id: opts.tenantId }),
        ...(opts?.from && { start_date_from: opts.from }),
        ...(opts?.until && { start_date_to: opts.until }),
      },
    });
    return tournaments;
  } catch (e: any) {
    throw new Error(`failed to get classes: ${e}`);
  }
};

/**
 * gets a class by its id
 */
export const getTournamentById = async (
  client: PlaytomicHttpClient,
  tournamentId: string
): Promise<Class[]> => {
  try {
    const classes = await client.get<Class[]>(`/v1/tournamets/${tournamentId}`);
    return classes;
  } catch (e: any) {
    throw new Error(`failed to get tournament ${tournamentId}: ${e}`);
  }
};
