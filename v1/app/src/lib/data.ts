import { SavedCertificate, UpstreamTarget } from "./types";

export const bundleServer = [
  { id: 'srv-1', name: 'auth-api-service-01', ip: '10.10.10.1', port: 8080 },
  { id: 'srv-2', name: 'auth-api-service-02', ip: '10.10.10.2', port: 8080 },
  { id: 'srv-3', name: 'user-profile-service', ip: '10.10.10.5', port: 3000 },
];


// Mock list of upstream service targets/bundles
export const mockUpstreamTargets: UpstreamTarget[] = [
  { id: 'bundle-1', name: 'auth-cluster-pool', type: 'Bundle' },
  { id: 'bundle-2', name: 'user-profile-pool', type: 'Bundle' },
  { id: 'srv-1', name: 'auth-api-service-01 (10.10.10.1:8080)', type: 'Standalone' },
];

// Mock list of generated/saved certificates
export const mockSavedCertificates: SavedCertificate[] = [
  { id: 'cert-1', name: 'api.example.com (Certbot Let\'s Encrypt - Auto Renew)', issuer: 'Let\'s Encrypt' },
  { id: 'cert-2', name: 'wildcard-fehmicorp-com (Custom Wildcard CRT)', issuer: 'DigiCert' },
  { id: 'cert-3', name: 'staging.example.com (Staging Certbot)', issuer: 'Let\'s Encrypt Staging' },
];