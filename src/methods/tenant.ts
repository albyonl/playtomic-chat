import { PlaytomicHttpClient } from "@/types/client.types.js";
import { Tenant } from "@/types/tenant.type.js";

/**
 * gets all tenants
 * you can filter down with coordinates
 */
export const getTenants = async (
  client: PlaytomicHttpClient,
  opts?: {
    coordinates?: { lat: number | string; lon: number | string };
    radius?: string | number;
  }
) => {
  try {
    const tenants = await client.get<Tenant[]>(`/v1/tenants`, {
      params: {
        ...(opts?.coordinates && {
          coordinate: `${opts.coordinates.lat},${opts.coordinates.lon}`,
        }),
        ...(opts?.radius && { radius: opts.radius }),
      },
    });
    return tenants;
  } catch (e: any) {
    throw new Error(`failed to get tenants: ${e}`);
  }
};

/**
 * gets a tenant (club) by its id
 */
export const getTenantById = async (
  client: PlaytomicHttpClient,
  tenantId: string
) => {
  try {
    const tenant = await client.get<Tenant>(`/v1/tenants/${tenantId}`);
    return tenant;
  } catch (e: any) {
    throw new Error(`failed to get tenant ${tenantId}: ${e}`);
  }
};
