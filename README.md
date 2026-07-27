Here is a complete, production-grade `README.md` for the `@fehmicorp/gateway-sdk` repository.

It includes setup instructions, full TypeScript code examples, error handling patterns, and detailed API references.

---

### `README.md`

```markdown
# @fehmicorp/gateway-sdk

[![npm version](https://img.shields.io/npm/v/@fehmicorp/gateway-sdk.svg?style=flat-square)](https://www.npmjs.com/package/@fehmicorp/gateway-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

The official Node.js & TypeScript SDK for programmatic administration, route management, and traffic rule orchestration on the **FehmiCorp API Gateway**.

---

## Key Features

- ⚡ **Zero-Dependency Core:** Lightweight client built on modern `fetch` APIs.
- 🛡️ **Fully Type-Safe:** Exhaustive TypeScript definitions for Services, Gateways, Routes, and Rules.
- 🔄 **Async Retry Mechanism:** Built-in exponential backoff for transient network errors.
- 🚨 **Structured Error Handling:** Strongly typed API exceptions with status code parsing.

---

## Installation

Install via your preferred package manager:

```bash
# npm
npm install @fehmicorp/gateway-sdk

# pnpm
pnpm add @fehmicorp/gateway-sdk

# yarn
yarn add @fehmicorp/gateway-sdk

```

---

## Quickstart

```typescript
import { GatewayClient } from '@fehmicorp/gateway-sdk';

const client = new GatewayClient({
  apiKey: process.env.GATEWAY_API_KEY!,
  endpoint: '[https://api.gateway.fehmicorp.internal](https://api.gateway.fehmicorp.internal)', // defaults to local control plane
});

async function main() {
  // Fetch active gateways
  const gateways = await client.gateways.list();
  console.log(`Active Gateways: ${gateways.length}`);

  // Create a new HTTP Route
  const route = await client.routes.create({
    gatewayId: 'gw_edge_01',
    pathPattern: '/v2/auth/*',
    methods: ['GET', 'POST'],
    targetServiceId: 'svc_auth_cluster',
    stripPrefix: true,
  });

  console.log(`Created Route ID: ${route.id}`);
}

main().catch(console.error);

```

---

## SDK Architecture & Usage

### 1. Gateway Client Configuration

Customize timeouts, retry behaviors, and request headers during instantiation:

```typescript
import { GatewayClient } from '@fehmicorp/gateway-sdk';

const client = new GatewayClient({
  apiKey: 'gw_live_9f8a3b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  endpoint: '[https://api.gateway.internal](https://api.gateway.internal)',
  timeoutMs: 5000,
  maxRetries: 3,
  headers: {
    'X-Client-Origin': 'control-plane-cli',
  },
});

```

---

### 2. Managing Services & Bundles

Register backend instances and load-balanced service bundles:

```typescript
// Register a standalone backend service
const service = await client.services.create({
  serviceName: 'user-auth-service',
  targetIp: '10.0.1.42',
  targetPort: 8080,
  protocol: 'http',
  healthCheck: {
    enabled: true,
    path: '/healthz',
    intervalSeconds: 10,
  },
});

// Create a Load-Balanced Bundle
const bundle = await client.bundles.create({
  bundleName: 'auth-lb-group',
  lbAlgorithm: 'round_robin',
  members: [
    { serviceId: service.id, weight: 80 },
    { serviceId: 'svc_auth_backup', weight: 20 },
  ],
  stickySession: true,
});

```

---

### 3. Policy & Traffic Rule Enforcement

Attach security rules (JWT, Rate Limiting, IP Filtering) to routes or global scopes:

```typescript
// Create a Global Rate Limiting Rule
const rateLimitRule = await client.rules.create({
  ruleName: 'Auth Enforcement Policy',
  ruleType: 'RATE_LIMIT',
  scope: 'Global',
  status: 'active',
  params: {
    requestsPerMinute: 120,
    burstCapacity: 20,
  },
});

// Create a Rule Group
const policyGroup = await client.ruleGroups.create({
  groupName: 'Edge-Security-Policy',
  ruleIds: [rateLimitRule.id],
  executionMode: 'Sequential',
  enforcementLevel: 'Strict',
});

```

---

### 4. Error Handling

All SDK methods throw specialized `GatewayError` exceptions containing response contexts:

```typescript
import { GatewayClient, GatewayError } from '@fehmicorp/gateway-sdk';

try {
  await client.routes.get('invalid_id');
} catch (error) {
  if (error instanceof GatewayError) {
    console.error(`API Error [Status ${error.statusCode}]: ${error.message}`);
    console.error('Error Code:', error.code);
    console.error('Trace ID:', error.traceId);
  } else {
    console.error('Unexpected error:', error);
  }
}

```

---

## API Reference

| Module | Method | Description |
| --- | --- | --- |
| `client.gateways` | `.list(params?)` | Retrieve registered edge gateways |
|  | `.get(id)` | Fetch single gateway details |
|  | `.create(payload)` | Provision a new edge gateway binding |
| `client.routes` | `.listByGateway(gwId)` | List all routes bound to a gateway |
|  | `.create(payload)` | Attach a path match route to a service |
|  | `.delete(id)` | Remove an active route |
| `client.services` | `.create(payload)` | Register an upstream backend host |
|  | `.healthCheck(id)` | Trigger an immediate active health probe |
| `client.rules` | `.create(payload)` | Instantiate a CORS, Rate Limit, or Auth rule |
|  | `.updateStatus(id, status)` | Enable or disable a rule dynamically |

---

## Development & Testing

```bash
# Clone repository
git clone [https://github.com/fehmicorp/gateway-sdk.git](https://github.com/fehmicorp/gateway-sdk.git)
cd gateway-sdk

# Install dependencies
pnpm install

# Run test suite
pnpm test

# Build package
pnpm build

```

---

## License

Distributed under the MIT License. See [`LICENSE`](https://www.google.com/search?q=./LICENSE) for details. Developed and maintained by **Fehmi Corporation**.

```

```