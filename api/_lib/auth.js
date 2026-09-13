import { timingSafeEqual } from 'crypto';
import { getRedis } from './redis.js';

const MAX_ATTEMPTS = 8;
const LOCKOUT_SECONDS = 15 * 60;

export function pinMatches(providedPin, envPin) {
  if (!providedPin || !envPin) return false;
  const a = Buffer.from(String(providedPin));
  const b = Buffer.from(String(envPin));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isLockedOut(attempts) {
  return attempts >= MAX_ATTEMPTS;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = Array.isArray(fwd) ? fwd[0] : fwd;
  return first?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

export async function requireAdmin(req, res) {
  const redis = getRedis();
  const key = `ratelimit:pin:${clientIp(req)}`;

  const attempts = Number((await redis.get(key)) || 0);
  if (isLockedOut(attempts)) {
    res.status(429).json({ error: 'Demasiados intentos, espera unos minutos' });
    return false;
  }

  const provided = req.headers['x-admin-pin'];
  if (!pinMatches(provided, process.env.ADMIN_PIN)) {
    // ponytail: read-then-write isn't atomic, so two concurrent requests can
    // both slip in under the cap once in a while. Fine for a single-owner
    // admin PIN; move to a Redis INCR/Lua script if this ever needs to hold
    // against a real distributed brute force.
    await redis.set(key, attempts + 1, { ex: LOCKOUT_SECONDS });
    res.status(401).json({ error: 'PIN incorrecto' });
    return false;
  }

  if (attempts > 0) await redis.del(key);
  return true;
}
