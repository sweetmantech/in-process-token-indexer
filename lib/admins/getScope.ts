import { Catalog_Admins_t, InProcess_Admins_t } from '@/types/envio';

export function getScope(admin: InProcess_Admins_t | Catalog_Admins_t): number {
  return 'permission' in admin ? admin.permission : admin.auth_scope;
}
