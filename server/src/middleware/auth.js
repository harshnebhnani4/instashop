import jwt from "jsonwebtoken";

export function signAdminToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Verifies the Bearer token and attaches { role, email, promoCode? } to req.admin.
// If `roles` is given, rejects anyone whose role isn't in the list.
export function requireAuth(roles) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Login required" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Not allowed" });
      }
      req.admin = decoded;
      next();
    } catch {
      return res.status(401).json({ error: "Session expired, please log in again" });
    }
  };
}
