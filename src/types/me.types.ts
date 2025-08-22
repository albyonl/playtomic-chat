import { User, UserStatus } from "./user.types";

export interface Me extends User {
  is_deleted: boolean;
  accepts_privacy: boolean;
  accepts_commercial: boolean;
  linked_accounts: any[];
  organization_linked_accounts: any[];
  coach_accounts: any[];
  tenant_owner_accounts: any[];
  birth_date: string | null;
  gender: string | null;
  user_roles: {
    user_role: string;
    tenant_id: string;
    scope_id: string;
  }[];
  active_permissions: any | null;
  created_by_user: string | null;
  created_by_tenant: string | null;
  created_by_organization: string | null;
  subscription_id: string | null;
  type: UserStatus;
}
