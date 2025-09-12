interface StatusConfig {
  value: string;
  name: string;
  color: string;
  description: string;
}

const DEFAULT_STATUSES: StatusConfig[] = [
  { value: 'green', name: 'Compliant', color: 'green', description: 'Control is fully implemented and working' },
  { value: 'yellow', name: 'In Progress', color: 'yellow', description: 'Control is being implemented or partially complete' },
  { value: 'red', name: 'Non-Compliant', color: 'red', description: 'Control is not implemented or not working' },
  { value: 'unknown', name: 'Unknown', color: 'gray', description: 'Control status is unknown or not assessed' }
];

export function getStatusConfig(): StatusConfig[] {
  const saved = localStorage.getItem('statusConfig');
  return saved ? JSON.parse(saved) : DEFAULT_STATUSES;
}

export function getStatusName(value: string): string {
  const config = getStatusConfig();
  const status = config.find(s => s.value === value);
  return status?.name || value;
}

export function getStatusByValue(value: string): StatusConfig | undefined {
  const config = getStatusConfig();
  return config.find(s => s.value === value);
}

export { DEFAULT_STATUSES };
export type { StatusConfig };