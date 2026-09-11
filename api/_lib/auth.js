export function pinMatches(providedPin, envPin) {
  if (!providedPin || !envPin) return false;
  return String(providedPin) === String(envPin);
}

export function requireAdmin(req, res) {
  const provided = req.headers['x-admin-pin'];
  if (!pinMatches(provided, process.env.ADMIN_PIN)) {
    res.status(401).json({ error: 'PIN incorrecto' });
    return false;
  }
  return true;
}
