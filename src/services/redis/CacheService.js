const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });
    this._client.on('error', (e) => {
      console.error(e);
    });
    this._client.connect();
  }

  async set(k, v, expirationInSecond = 1800) {
    await this._client.set(k, v, {
      EX: expirationInSecond,
    });
  }

  async get(k) {
    const result = await this._client.get(k);
    if (result == null) {
      throw new Error('Cache not found');
    }
    return result;
  }

  async delete(k) {
    return this._client.del(k);
  }
}

module.exports = CacheService;
