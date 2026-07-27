export interface GatewaySDKOptions {
  baseUrl?: string;
}

export class GatewaySDK {
  constructor(options?: GatewaySDKOptions);
  healthCheck(): Promise<any>;
}