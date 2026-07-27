// Export your SDK client and helpers here
class GatewaySDK {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:4040';
  }

  async healthCheck() {
    const res = await fetch(`${this.baseUrl}/health`);
    return res.json();
  }
}

module.exports = { GatewaySDK };