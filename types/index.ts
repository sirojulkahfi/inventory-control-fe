export * from './common';

export interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractDocument?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  uom: string;
  parentUom?: string;
  conversion?: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  category?: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  roleId?: string;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

// RoleType sebagai runtime enum untuk Dropdown/Select
export enum RoleType {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  OPERATOR = 'Operator'
}

export interface Permission {
  id: string;
  roleId?: string;
  action: string;
  subject: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InboundReceive {
  id: string;
  manifestNo: string;
  route?: string;
  supplierName?: string;
  dockCode?: string;
  orderQty?: number;
  status: string;
  shift?: string;
  arrivalTime?: string;
  nameReceived?: string;
  createdAt: string;
  updatedAt: string;
}
