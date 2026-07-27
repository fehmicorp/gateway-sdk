import { HttpMethod, LoadBalancingAlgorithm, SidebarItem, SidebarKey } from "./types";

export const LBAlg = {
  '': 'Select Algorithm',
  round_robin: 'Weighted Round Robin',
  least_connections: 'Least Connections',
  ip_hash: 'IP Hash / Sticky Client IP',
} as const;

export const LB_ALGORITHM_OPTIONS = Object.entries(LBAlg).map(([key, label]) => ({
  value: key,
  label: label,
}));

export const PROTOCOL_MAP = {
  '': 'Select Protocol',
  http: 'HTTP (Hypertext Transfer Protocol)',
  https: 'HTTPS (HTTP Secure / TLS)',
  wss: 'WSS (WebSocket Secure)',
  grpc: 'gRPC (High Performance RPC)',
  smtp: 'SMTP (Simple Mail Transfer)',
  mongos: 'MongoDB Sharded Gateway',
  mysql: 'MySQL Database Protocol',
  sql: 'Generic SQL Protocol',
} as const;

export const PROTOCOL_OPTIONS = Object.entries(PROTOCOL_MAP).map(([value, label]) => ({
  value,
  label,
}));

export const CERT_PROVISION_TYPES = {
  '': 'Select Provisioning Method',
  certbot: 'Automated ACME / Certbot',
  custom: 'Manual Upload (CRT / KEY)',
  imported_ca: 'Internal Enterprise CA',
  vault: 'HashiCorp Vault PKI',
  aws_acm: 'AWS Certificate Manager (ACM)',
} as const;

export const PROVISION_TYPE_OPTIONS = Object.entries(CERT_PROVISION_TYPES).map(
  ([value, label]) => ({ value, label })
);

export const ACME_PROVIDERS = {
  '': 'Select ACME Provider',
  'letsencrypt-prod': "Let's Encrypt (Production)",
  'letsencrypt-staging': "Let's Encrypt (Staging / Testing)",
  zerossl: 'ZeroSSL ACME',
  buypass: 'Buypass Go SSL',
  'google-trust': 'Google Trust Services ACME',
  'custom-acme': 'Custom Enterprise ACME Server',
} as const;

export const ACME_PROVIDER_OPTIONS = Object.entries(ACME_PROVIDERS).map(
  ([value, label]) => ({ value, label })
);

export const ACME_CHALLENGE_TYPES = {
  '': 'Select Validation Method',
  'http-01': 'HTTP-01 (Webroot / HTTP Port 80)',
  'dns-01': 'DNS-01 (TXT Record / Wildcard Support)',
  'tls-alpn-01': 'TLS-ALPN-01 (TLS Port 443 Direct)',
} as const;

export const ACME_CHALLENGE_OPTIONS = Object.entries(ACME_CHALLENGE_TYPES).map(
  ([value, label]) => ({ value, label })
);

export const AVAILABLE_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'ALL'];


export const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: '📊' },
  { key: 'services', label: 'Services & Bundles', href: '/services', icon: '🌐' },
  { key: 'routes', label: 'Ingress Routes', href: '/routes', icon: '🔀' },
  { key: 'cluster', label: 'VRRP & Gateways', href: '/cluster', icon: '⚡' },
  { key: 'rules', label: 'Rules Engine', href: '/rules', icon: '📜' },
  { key: 'policy', label: 'Policy Groups', href: '/policy', icon: '🛡️' },
  { key: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' },
];

