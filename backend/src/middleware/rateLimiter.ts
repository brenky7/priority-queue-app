import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { warn as logWarn, debug as logDebug } from "../utils/logger";

// Načítanie konfiguračných premenných
const windowMs = parseInt(
  process.env.API_TASK_ADD_LIMIT_WINDOW_MS || "60000",
  10
);
const maxRequests = parseInt(
  process.env.API_TASK_ADD_LIMIT_MAX_REQUESTS || "10",
  10
);

// Rate limiter pre pridávanie úloh
export const addTaskRateLimiter = rateLimit({
  windowMs: windowMs,
  limit: maxRequests,
  message:
    "Príliš veľa požiadaviek na pridanie úloh z tejto IP adresy. Skúste to znova neskôr.",
  statusCode: 429, // Too Many Requests
  standardHeaders: true, // Vráti RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  legacyHeaders: false,

  // Handler na prekročenie limitu
  handler: (req, res, next, options) => {
    logWarn(
      `Rate limit prekročený pre IP: ${req.ip} na ${req.originalUrl}. Limit: ${
        options.limit
      } požiadaviek za ${options.windowMs / 1000}s.`
    );
    res.status(options.statusCode).send(options.message);
  },

  // Kľúč pre identifikáciu klienta
  keyGenerator: (req) => {
    const ipFromRequest = req.ip;
    const xForwardedForHeader = req.headers["x-forwarded-for"];

    let clientIp: string | undefined;

    // 1. Primárne: X-Forwarded-For hlavička
    if (
      typeof xForwardedForHeader === "string" &&
      xForwardedForHeader.length > 0
    ) {
      clientIp = xForwardedForHeader.split(",")[0]?.trim();
    } else if (
      Array.isArray(xForwardedForHeader) &&
      xForwardedForHeader.length > 0
    ) {
      const firstForwardedIp = xForwardedForHeader[0];
      if (typeof firstForwardedIp === "string" && firstForwardedIp.length > 0) {
        clientIp = firstForwardedIp.split(",")[0]?.trim();
      }
    }

    // 2. Sekundárne: req.ip
    if (!clientIp && ipFromRequest) {
      clientIp = ipFromRequest;
    }

    return ipKeyGenerator(clientIp ?? "unknown");
  },
});

logDebug(
  `Rate limiting nastavený: ${maxRequests} požiadaviek za ${
    windowMs / 1000
  } sekúnd.`
);
