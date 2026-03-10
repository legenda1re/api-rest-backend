const corsOptions = () => {
  const rawOrigins = process.env.CORS_ORIGINS;

  if (!rawOrigins) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("[FATAL] CORS_ORIGINS est obligatoire en production");
    }
    return { origin: 'http://localhost:3000', credentials: true };
  }

  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origine non autorisée par CORS : ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
    maxAge: 600,
  };
};

module.exports = corsOptions;
