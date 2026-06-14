/**
 * Perspecto — License Key Validation
 * Vercel Serverless Function → calls Polar.sh API
 *
 * SETUP (one-time, ~5 minutes):
 * ─────────────────────────────
 * 1. Go to polar.sh → Products → Create Product
 *    - Type: "License Keys"
 *    - Price: $19 one-time
 *    - Name: "Perspecto Pro"
 *    - Copy the product checkout URL for POLAR_CHECKOUT_URL in App.jsx
 *
 * 2. Go to polar.sh → Settings → API → Create Access Token
 *    - Scopes: license_keys:read
 *
 * 3. Go to polar.sh → Settings → copy your Organization ID
 *
 * 4. In Vercel Dashboard → your project → Settings → Environment Variables:
 *    POLAR_ACCESS_TOKEN  =  your_access_token_here
 *    POLAR_ORG_ID        =  your_organization_id_here
 *
 * 5. Redeploy: npx vercel --prod
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ valid: false });

  let key;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    key = body?.key?.trim();
  } catch {
    return res.status(400).json({ valid: false, error: "Invalid request body" });
  }

  if (!key) return res.status(400).json({ valid: false, error: "License key is required" });

  const POLAR_TOKEN = process.env.POLAR_ACCESS_TOKEN;
  const ORG_ID      = process.env.POLAR_ORG_ID;

  // Dev mode: accept a test key without real API call
  if (!POLAR_TOKEN || !ORG_ID) {
    if (key === "PERSPECTO-DEV-TEST-KEY") {
      return res.status(200).json({ valid: true, dev: true });
    }
    return res.status(500).json({
      valid: false,
      error: "Payment system not configured — see api/validate-license.js for setup instructions",
    });
  }

  try {
    const response = await fetch("https://api.polar.sh/v1/license-keys/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${POLAR_TOKEN}`,
      },
      body: JSON.stringify({
        key,
        organization_id: ORG_ID,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ valid: true, email: data.user?.email });
    }

    const err = await response.json().catch(() => ({}));
    return res.status(200).json({
      valid: false,
      error: err.detail || "Invalid license key — check for typos and try again",
    });
  } catch (error) {
    console.error("License validation error:", error);
    return res.status(500).json({
      valid: false,
      error: "Validation service unavailable — please try again in a moment",
    });
  }
}
