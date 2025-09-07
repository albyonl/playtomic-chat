import { Class } from "@/types/class.types.js";
import { PlaytomicHttpClient } from "@/types/client.types.js";

/**
 * gets all classes
 */
export const getClasses = async (
  client: PlaytomicHttpClient,
  opts?: {
    from?: Date;
    until?: Date;
    tenantId?: string;
  }
): Promise<Class[]> => {
  try {
    const classes = await client.get<Class[]>(`/v1/classes`, {
      params: {
        ...(opts?.tenantId && { tenant_id: opts.tenantId }),
        ...(opts?.from && { start_date_from: opts.from }),
        ...(opts?.until && { start_date_to: opts.until }),
      },
    });
    return classes;
  } catch (e: any) {
    throw new Error(`failed to get classes: ${e}`);
  }
};

/**
 * gets a class by its id
 */
export const getClassById = async (
  client: PlaytomicHttpClient,
  classId: string
): Promise<Class[]> => {
  try {
    const classes = await client.get<Class[]>(`/v1/classes/${classId}`);
    return classes;
  } catch (e: any) {
    throw new Error(`failed to get class ${classId}: ${e}`);
  }
};
