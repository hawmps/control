import type { Item, Environment, SecurityControl, ControlImplementation, SubControl } from '../types';

const API_BASE = 'http://localhost:3001/api';

// Mock Environments - representing systems, applications, or assets (for reference)
export const mockEnvironments: Environment[] = [
  {
    id: 1,
    name: 'Customer Portal Web Application',
    description: 'Public-facing web application for customer self-service',
    category: 'Web Application',
    item_type: 'Application',
    owner: 'Engineering Team',
    criticality: 'high' as any,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by: 1
  },
  {
    id: 2,
    name: 'Payment Processing System',
    description: 'Core payment processing infrastructure',
    category: 'Financial System',
    item_type: 'System',
    owner: 'Finance Team',
    criticality: 'critical' as any,
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z',
    created_by: 2
  },
  {
    id: 3,
    name: 'Employee Database',
    description: 'Internal HR database containing employee records',
    category: 'Database',
    item_type: 'Database',
    owner: 'HR Team',
    criticality: 'high' as any,
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z',
    created_by: 1
  },
  {
    id: 4,
    name: 'Marketing Website',
    description: 'Public marketing and company information website',
    category: 'Web Application',
    item_type: 'Application',
    owner: 'Marketing Team',
    criticality: 'medium' as any,
    created_at: '2024-01-12T16:45:00Z',
    updated_at: '2024-01-12T16:45:00Z',
    created_by: 3
  }
];

// Mock Security Controls - simplified to just names
export const mockSecurityControls: SecurityControl[] = [
  {
    id: 1,
    name: 'Access Control',
    description: 'User authentication and authorization',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 1
  },
  {
    id: 2,
    name: 'Data Encryption',
    description: 'Encryption of sensitive data',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 1
  },
  {
    id: 3,
    name: 'Vulnerability Management',
    description: 'Regular vulnerability scanning and patching',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 1
  },
  {
    id: 4,
    name: 'Audit Logging',
    description: 'System and user activity logging',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 1
  },
  {
    id: 5,
    name: 'Backup and Recovery',
    description: 'Data backup and disaster recovery',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 1
  }
];

// Mock Control Implementations - mapping controls to items with Red/Yellow/Green status
export const mockControlImplementations: ControlImplementation[] = [
  // Customer Portal Web Application
  { id: 1, item_id: 1, control_id: 1, status: 'green' as any, notes: 'Multi-factor authentication implemented', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-01-28T15:45:00Z', created_by: 1 },
  { id: 2, item_id: 1, control_id: 2, status: 'green' as any, notes: 'TLS 1.3 and AES-256 encryption in place', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-02-10T11:20:00Z', created_by: 1 },
  { id: 3, item_id: 1, control_id: 3, status: 'yellow' as any, notes: 'Weekly scans running, CI/CD integration in progress', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-02-15T09:30:00Z', created_by: 1 },
  { id: 4, item_id: 1, control_id: 4, status: 'green' as any, notes: 'Comprehensive audit logging implemented', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-02-15T09:30:00Z', created_by: 1 },
  { id: 5, item_id: 1, control_id: 5, status: 'yellow' as any, notes: 'Daily backups configured, testing recovery procedures', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-02-15T09:30:00Z', created_by: 1 },
  
  // Payment Processing System
  { id: 6, item_id: 2, control_id: 1, status: 'green' as any, notes: 'Hardware security modules and biometric auth', created_at: '2024-01-16T14:20:00Z', updated_at: '2024-01-18T16:30:00Z', created_by: 2 },
  { id: 7, item_id: 2, control_id: 2, status: 'green' as any, notes: 'PCI DSS compliant encryption and tokenization', created_at: '2024-01-16T14:20:00Z', updated_at: '2024-01-22T10:15:00Z', created_by: 2 },
  { id: 8, item_id: 2, control_id: 3, status: 'green' as any, notes: 'Automated vulnerability scanning with immediate alerts', created_at: '2024-01-16T14:20:00Z', updated_at: '2024-01-18T16:30:00Z', created_by: 2 },
  { id: 9, item_id: 2, control_id: 4, status: 'green' as any, notes: 'Tamper-evident transaction logging', created_at: '2024-01-16T14:20:00Z', updated_at: '2024-01-30T14:45:00Z', created_by: 2 },
  { id: 10, item_id: 2, control_id: 5, status: 'green' as any, notes: 'Real-time replication and tested disaster recovery', created_at: '2024-01-16T14:20:00Z', updated_at: '2024-01-22T10:15:00Z', created_by: 2 },
  
  // Employee Database
  { id: 11, item_id: 3, control_id: 1, status: 'green' as any, notes: 'Active Directory integration with role-based access', created_at: '2024-01-10T09:15:00Z', updated_at: '2024-01-12T13:20:00Z', created_by: 1 },
  { id: 12, item_id: 3, control_id: 2, status: 'yellow' as any, notes: 'Database encryption enabled, reviewing key management', created_at: '2024-01-10T09:15:00Z', updated_at: '2024-01-12T13:20:00Z', created_by: 1 },
  { id: 13, item_id: 3, control_id: 3, status: 'yellow' as any, notes: 'Monthly scans scheduled, working on patch automation', created_at: '2024-01-10T09:15:00Z', updated_at: '2024-01-12T13:20:00Z', created_by: 1 },
  { id: 14, item_id: 3, control_id: 4, status: 'green' as any, notes: 'All HR database access logged and monitored', created_at: '2024-01-10T09:15:00Z', updated_at: '2024-01-12T13:20:00Z', created_by: 1 },
  { id: 15, item_id: 3, control_id: 5, status: 'red' as any, notes: 'Backup infrastructure pending budget approval', created_at: '2024-01-10T09:15:00Z', updated_at: '2024-02-01T10:00:00Z', created_by: 1 },
  
  // Marketing Website
  { id: 16, item_id: 4, control_id: 1, status: 'yellow' as any, notes: 'Basic authentication, planning MFA implementation', created_at: '2024-01-12T16:45:00Z', updated_at: '2024-02-10T11:30:00Z', created_by: 3 },
  { id: 17, item_id: 4, control_id: 2, status: 'green' as any, notes: 'HTTPS enabled, no sensitive data collected', created_at: '2024-01-12T16:45:00Z', updated_at: '2024-01-15T09:20:00Z', created_by: 3 },
  { id: 18, item_id: 4, control_id: 3, status: 'yellow' as any, notes: 'Monthly scans running, working on automated patching', created_at: '2024-01-12T16:45:00Z', updated_at: '2024-02-10T11:30:00Z', created_by: 3 },
  { id: 19, item_id: 4, control_id: 4, status: 'yellow' as any, notes: 'Basic web server logs, enhancing monitoring', created_at: '2024-01-12T16:45:00Z', updated_at: '2024-02-10T11:30:00Z', created_by: 3 },
  { id: 20, item_id: 4, control_id: 5, status: 'green' as any, notes: 'Static site with automated daily backups', created_at: '2024-01-12T16:45:00Z', updated_at: '2024-02-10T11:30:00Z', created_by: 3 }
];

// API service functions
export const getItems = async (): Promise<Item[]> => {
  const response = await fetch(`${API_BASE}/items`);
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
};

// Alias for environments (same as items for now)
export const getEnvironments = async (): Promise<Environment[]> => {
  return getItems();
};

export const getSecurityControls = async (): Promise<SecurityControl[]> => {
  const response = await fetch(`${API_BASE}/controls`);
  if (!response.ok) throw new Error('Failed to fetch controls');
  return response.json();
};

export const getControlImplementations = async (): Promise<ControlImplementation[]> => {
  const response = await fetch(`${API_BASE}/implementations`);
  if (!response.ok) throw new Error('Failed to fetch implementations');
  return response.json();
};

export const getControlMatrixData = async () => {
  const response = await fetch(`${API_BASE}/matrix`);
  if (!response.ok) throw new Error('Failed to fetch matrix data');
  return response.json();
};

export const getControlImplementationsByItem = async (itemId: number): Promise<ControlImplementation[]> => {
  const implementations = await getControlImplementations();
  return implementations.filter(impl => impl.item_id === itemId);
};

// Alias for environments
export const getControlImplementationsByEnvironment = async (environmentId: number): Promise<ControlImplementation[]> => {
  return getControlImplementationsByItem(environmentId);
};

export const getControlImplementationsByControl = async (controlId: number): Promise<ControlImplementation[]> => {
  const implementations = await getControlImplementations();
  return implementations.filter(impl => impl.control_id === controlId);
};

export const updateControlImplementation = async (itemId: number, controlId: number, status: string, notes: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/implementations/${itemId}/${controlId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });
  if (!response.ok) throw new Error('Failed to update control implementation');
};

export const createItem = async (itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> => {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) throw new Error('Failed to create item');
  return response.json();
};

// Alias for environments
export const createEnvironment = async (environmentData: Omit<Environment, 'id' | 'created_at' | 'updated_at'>): Promise<Environment> => {
  return createItem(environmentData);
};

export const updateItem = async (id: number, itemData: Partial<Omit<Item, 'id' | 'created_at'>>): Promise<void> => {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) throw new Error('Failed to update item');
};

// Alias for environments
export const updateEnvironment = async (id: number, environmentData: Partial<Omit<Environment, 'id' | 'created_at'>>): Promise<void> => {
  return updateItem(id, environmentData);
};

export const deleteItem = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete item');
};

// Alias for environments
export const deleteEnvironment = async (id: number): Promise<void> => {
  return deleteItem(id);
};

export const createSecurityControl = async (controlData: Omit<SecurityControl, 'id' | 'created_at' | 'updated_at'>): Promise<SecurityControl> => {
  const response = await fetch(`${API_BASE}/controls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(controlData),
  });
  if (!response.ok) throw new Error('Failed to create control');
  return response.json();
};

export const updateSecurityControl = async (id: number, controlData: Partial<Omit<SecurityControl, 'id' | 'created_at'>>): Promise<void> => {
  const response = await fetch(`${API_BASE}/controls/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(controlData),
  });
  if (!response.ok) throw new Error('Failed to update control');
};

export const deleteSecurityControl = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/controls/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete control');
};

// Sub-control service functions
export const getSubControls = async (): Promise<SubControl[]> => {
  const response = await fetch(`${API_BASE}/sub-controls`);
  if (!response.ok) throw new Error('Failed to fetch sub-controls');
  return response.json();
};

export const getSubControlsByControl = async (controlId: number): Promise<SubControl[]> => {
  const response = await fetch(`${API_BASE}/sub-controls/control/${controlId}`);
  if (!response.ok) throw new Error('Failed to fetch sub-controls for control');
  return response.json();
};

export const createSubControl = async (subControlData: Omit<SubControl, 'id' | 'created_at' | 'updated_at'>): Promise<SubControl> => {
  const response = await fetch(`${API_BASE}/sub-controls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subControlData),
  });
  if (!response.ok) throw new Error('Failed to create sub-control');
  return response.json();
};

export const updateSubControl = async (id: number, subControlData: Partial<Omit<SubControl, 'id' | 'created_at'>>): Promise<void> => {
  const response = await fetch(`${API_BASE}/sub-controls/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subControlData),
  });
  if (!response.ok) throw new Error('Failed to update sub-control');
};

export const deleteSubControl = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/sub-controls/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete sub-control');
};