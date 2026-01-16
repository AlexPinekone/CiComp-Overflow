// src/lib/redis.ts
import 'server-only';
import { createClient, RedisClientType } from 'redis';

type RedisOpts = {
	host?: string;
	port?: number;
	password?: string;
	url?: string;
};

declare global {
	var _redisSingleton: RedisCache | undefined;
}

class RedisCache {
	private client: RedisClientType;
	private connected = false;

	private constructor(opts?: RedisOpts) {
		this.client = opts?.url
			? createClient({ url: opts.url })
			: createClient({
					socket: {
						host: opts?.host ?? process.env.REDIS_HOST ?? 'redis',
						port:
							opts?.port ??
							(process.env.REDIS_PORT
								? Number(process.env.REDIS_PORT)
								: 6379),
					},
					password: opts?.password ?? process.env.REDIS_PASSWORD,
				});

		this.client.on('error', (err) => {
			console.error('[Redis] error:', err);
		});
	}

	static async getInstance(opts?: RedisOpts): Promise<RedisCache> {
		const isProd = process.env.NODE_ENV === 'production';
		const existing = !isProd ? globalThis._redisSingleton : undefined;
		const instance = existing ?? new RedisCache(opts);

		await instance.ensureConnected();

		if (!isProd) {
			globalThis._redisSingleton = instance;
		}
		return instance;
	}

	private async ensureConnected() {
		if (!this.connected) {
			await this.client.connect();
			this.connected = true;
			console.log('✅ Redis conectado (Next.js server)');
		}
	}

	async set(key: string, value: string, ttlSeconds?: number) {
		if (ttlSeconds && ttlSeconds > 0) {
			await this.client.set(key, value, { EX: ttlSeconds });
		} else {
			await this.client.set(key, value);
		}
	}

	async get(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	async del(key: string) {
		await this.client.del(key);
	}

	async exists(key: string): Promise<boolean> {
		const n = await this.client.exists(key);
		return n > 0;
	}

	async expire(key: string, ttlSeconds: number) {
		await this.client.expire(key, ttlSeconds);
	}

	async setJSON<T>(key: string, value: T, ttlSeconds?: number) {
		const payload = JSON.stringify(value);
		await this.set(key, payload, ttlSeconds);
	}

	async getJSON<T>(key: string): Promise<T | null> {
		const raw = await this.get(key);
		return raw ? (JSON.parse(raw) as T) : null;
	}

	async clearByPrefix(prefix: string) {
		const pattern = `${prefix}:*`;
		const keys: string[] = [];
		for await (const key of this.client.scanIterator({
			MATCH: pattern,
			COUNT: 100,
		})) {
			keys.push(key);
		}
		if (keys.length > 0) {
			await this.client.del(keys);
		}
	}

	raw(): RedisClientType {
		return this.client;
	}

	buildKey(base: string, ...parts: (string | number)[]): string {
		const key = [base, ...parts].join(':');
		return key;
	}
}

export { RedisCache };
