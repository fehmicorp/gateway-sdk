// src/lib/types.ts

// ==========================================
// Base Enums & Union Types
// ==========================================

export type ServiceProtocol = 'http' | 'https' | 'websocket' | 'grpc' | 'tcp' | 'udp';

export type SidebarKey = 'dashboard' | 'services' | 'routes' | 'rules' | 'cluster' | 'policy' | 'settings';

export type LoadBalancingAlgorithm = 'round_robin' | 'least_connections' | 'ip_hash' | null;
export type CertProvisionType = 'certbot' | 'custom' | 'imported_ca' | 'vault' | 'aws_acm' | null;
export type AcmeProvider = 'letsencrypt-prod' | 'letsencrypt-staging' | 'zerossl' | 'buypass' | 'google-trust' | 'custom-acme' | null;

export type AcmeChallengeType = 'http-01' | 'dns-01' | 'tls-alpn-01' | null;

export type Protocols = 'http' | 'https' | 'wss' | 'grpc' | 'smtp' | 'mongos' | 'mysql' | 'sql' | null;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'ALL';

// Domain-Specific Status Types
export type GatewayStatus = 'active' | 'inactive' | 'provisioning' | 'error';
export type NodeRole = 'control_plane' | 'worker' | 'edge_proxy' | 'database';
export type NodeStatus = 'online' | 'offline' | 'degraded' | 'maintenance';
export type EdgeNodeStatus = 'online' | 'offline' | 'up' | 'down' | 'adopting';

// VRRP & Edge Proxy Types
export type VRRPState = 'MASTER' | 'BACKUP' | 'FAULT';
export type ProxyMode = 'http' | 'tcp' | 'udp';

// ==========================================
// Rules & Policy Engine Types
// ==========================================

/**
 * Supported traffic control, condition evaluation, authentication, and security policy types.
 */
export type RuleType = 
  | 'RATE_LIMIT'
  | 'CORS'
  | 'JWT_AUTH'
  | 'MTLS'
  | 'IP_RESTRICTION'
  | 'HEADER_TRANSFORM'
  | 'REQUEST_VALIDATION';

/**
 * Condition match modes for rule evaluation pipelines.
 */
export type ConditionType = 'HEADER_MATCH' | 'IP_MATCH' | 'PATH_MATCH' | 'METHOD_MATCH' | 'QUERY_MATCH' | 'CUSTOM_EXPRESSION';

/**
 * Action outcomes executed when a rule condition resolves to true.
 */
export type ActionType = 'ALLOW' | 'DENY' | 'HEADER_MODIFY' | 'RATE_LIMIT' | 'REDIRECT' | 'REWRITE';

/**
 * Target enforcement boundaries for a rule or rule group.
 */
export type RuleScope = 'Global' | 'Route Specific' | 'Cluster Level' | 'Specific Gateway';

/**
 * Status flags covering both edge evaluation and administrative state.
 */
export type RuleStatus = 'active' | 'inactive' | 'enabled' | 'disabled';

/**
 * Specific configuration parameters for structured policy rules.
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  burstCapacity: number;
}

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders?: string[];
  allowCredentials?: boolean;
}

export interface JwtAuthConfig {
  jwksUri: string;
  headerName?: string;
  issuer?: string;
  audience?: string;
}

export interface IpRestrictionConfig {
  allowedIps: string[];
  blockedIps: string[];
}

/**
 * Discriminated or generic payload for Rule parameters and action configs.
 */
export type RuleParams = 
  | RateLimitConfig 
  | CorsConfig 
  | JwtAuthConfig 
  | IpRestrictionConfig 
  | Record<string, unknown>;

/**
 * Individual Rule model supporting both high-level policies and evaluation pipelines.
 */
export interface Rule {
  id: string;
  ruleName: string;
  description?: string;
  priority?: number;
  
  // High-level Policy engine properties
  ruleType?: RuleType;
  scope?: RuleScope;
  params?: RuleParams;

  // Granular evaluation engine properties
  conditionType?: ConditionType;
  conditionExpression?: string;
  actionType?: ActionType;
  actionConfig?: Record<string, unknown>;

  status: RuleStatus;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Execution pipeline mode for rule sets.
 */
export type ExecutionMode = 'Sequential' | 'FirstMatchStop' | 'Parallel' | 'StrictAllMatch';

/**
 * Enforcement strictness level for policy groups.
 */
export type EnforcementLevel = 'Strict' | 'Permissive' | 'Audit-Only';

/**
 * Combined Rule Group / Policy Group model.
 */
export interface RuleGroup {
  id: string;
  groupName: string;
  description?: string;
  /**
   * References to individual attached rule IDs.
   */
  ruleIds: string[];
  /**
   * Embedded hydrated Rule objects when returned directly from API.
   */
  rules?: Rule[];
  
  executionMode?: ExecutionMode;
  targetScope?: RuleScope;
  enforcementLevel?: EnforcementLevel;
  targetRoutesCount?: number;

  createdAt: string;
  updatedAt?: string;
}

// Legacy alias for backward compatibility across existing components
export type PolicyGroup = {
  id: string;
  name: string;
  description: string;
  
};

// ==========================================
// UI Select Option & Navigation Types
// ==========================================

export interface SelectOption<T = string | null> {
  value: T;
  label: string;
}

export interface SidebarItem {
  key: SidebarKey;
  label: string;
  href: string;
  icon: string;
}

export const PROTOCOL_OPTIONS: SelectOption<Protocols>[] = [
  { value: 'https', label: 'HTTPS (HTTP/2 over TLS)' },
  { value: 'http', label: 'HTTP (Plaintext Port 80)' },
  { value: 'wss', label: 'WSS (Secure WebSockets)' },
  { value: 'grpc', label: 'gRPC over TLS' },
  { value: 'smtp', label: 'SMTP (Mail Transport)' },
  { value: 'mongos', label: 'MongoDB Wire Protocol' },
  { value: 'mysql', label: 'MySQL Database Protocol' },
  { value: 'sql', label: 'Generic SQL Protocol' },
];

export const SERVICE_PROTOCOL_OPTIONS: SelectOption<ServiceProtocol>[] = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'websocket', label: 'WebSocket (WS)' },
  { value: 'grpc', label: 'gRPC' },
  { value: 'tcp', label: 'TCP Layer 4' },
  { value: 'udp', label: 'UDP Layer 4' },
];

export const ACME_PROVIDER_OPTIONS: SelectOption<AcmeProvider>[] = [
  { value: 'letsencrypt-prod', label: "Let's Encrypt (Production)" },
  { value: 'letsencrypt-staging', label: "Let's Encrypt (Staging / Testing)" },
  { value: 'zerossl', label: 'ZeroSSL ACME' },
  { value: 'buypass', label: 'Buypass Go SSL' },
  { value: 'google-trust', label: 'Google Trust Services' },
  { value: 'custom-acme', label: 'Custom Corporate ACME Directory' },
];

export const ACME_CHALLENGE_OPTIONS: SelectOption<AcmeChallengeType>[] = [
  { value: 'http-01', label: 'HTTP-01 (Webroot / Standalone)' },
  { value: 'dns-01', label: 'DNS-01 (Wildcard / TXT Record)' },
  { value: 'tls-alpn-01', label: 'TLS-ALPN-01 (Port 443 Direct)' },
];

export const LOAD_BALANCING_OPTIONS: SelectOption<LoadBalancingAlgorithm>[] = [
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'least_connections', label: 'Least Connections' },
  { value: 'ip_hash', label: 'IP Hash (Source IP Sticky)' },
];

// ==========================================
// Core Infrastructure Domain Interfaces
// ==========================================

export interface HealthCheckConfig {
  enabled: boolean;
  path?: string;
  intervalSeconds?: number;
  timeoutSeconds?: number;
  healthyThreshold?: number;
  unhealthyThreshold?: number;
}

export interface Service {
  id: string;
  serviceName: string;
  targetIp: string;
  targetPort: number;
  protocol: ServiceProtocol;
  healthCheck: HealthCheckConfig;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface BundleMember {
  serviceId: string;
  weight: number;
}

export interface VirtualIpConfig {
  ip: string;
  vrid: number;
}

export interface BundleService {
  id: string;
  bundleName: string;
  lbAlgorithm: LoadBalancingAlgorithm;
  members: BundleMember[];
  virtualIp?: VirtualIpConfig | null;
  policyId?: string | null;
  stickySession: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CertbotConfig {
  email: string;
  provider: AcmeProvider;
  challengeType: AcmeChallengeType;
  autoRenew: boolean;
}

export interface CustomCertFiles {
  certFileUrl?: string;
  keyFileUrl?: string;
}

export interface SSLCertificate {
  id: string;
  certName: string;
  domains: string[];
  type: CertProvisionType;
  issuer?: string;
  certbotConfig?: CertbotConfig | null;
  customFiles?: CustomCertFiles | null;
  expiresAt?: string | Date;
  createdAt?: string | Date;
}

export interface SavedCertificate {
  id: string;
  name: string;
  issuer: string;
}

export interface UpstreamTarget {
  id: string;
  name: string;
  type: 'Bundle' | 'Standalone';
}

export interface Gateway {
  id: string;
  gatewayName: string;
  domainName: string;
  protocol: Protocols;
  upstreamTargetId: string;
  upstreamType: 'Standalone' | 'Bundle';
  certificateId?: string | null;
  forceSslRedirect: boolean;
  enableHsts: boolean;
  status?: GatewayStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RouteHeaderTransform {
  add?: Record<string, string>;
  remove?: string[];
}

export interface Route {
  id: string;
  gatewayId: string;
  pathPattern: string;
  methods: HttpMethod[];
  targetServiceId: string;
  stripPrefix?: boolean;
  rateLimitPolicyId?: string | null;
  corsEnabled?: boolean;
  headerTransforms?: RouteHeaderTransform;
  createdAt?: string | Date;
}

export interface NodeMetrics {
  cpuUsagePercentage?: number;
  memoryUsagePercentage?: number;
  diskUsagePercentage?: number;
  uptimeSeconds?: number;
}

export interface Node {
  id: string;
  hostname: string;
  ipAddress: string;
  role: NodeRole;
  status: NodeStatus;
  datacenterRegion?: string;
  installedVersion?: string;
  metrics?: NodeMetrics;
  lastHeartbeat?: string | Date;
  createdAt?: string | Date;
}

export interface GatewayNode {
  id: string;
  name: string;
  ip: string;
  vrrpState: VRRPState;
  vrrpPriority: number;
  dataPlaneApiStatus: EdgeNodeStatus;
  activeConnections: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface EdgeServerMember {
  name: string;
  address: string;
  port: number;
  weight: number;
  status: EdgeNodeStatus;
}

export interface EdgeService {
  id?: string;
  name: string;
  mode: ProxyMode;
  balanceAlgorithm: LoadBalancingAlgorithm;
  domain: string;
  servers: EdgeServerMember[];
}