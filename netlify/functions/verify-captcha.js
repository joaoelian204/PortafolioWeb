const https = require('https');

// Dominios permitidos (solo producción)
const ALLOWED_ORIGINS = [
  'https://portafolio-joao.netlify.app',
];

// Rate limiting simple (por IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 10; // máximo 10 verificaciones por minuto

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

exports.handler = async (event) => {
  // Obtener IP del cliente
  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';

  // Obtener el origen de la solicitud
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Rate limiting
  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
    };
  }

  try {
    // Validar body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Request body is required' }),
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      };
    }

    const { token } = parsed;

    if (!token || typeof token !== 'string' || token.length > 5000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Valid token is required' }),
      };
    }

    // Obtener el secreto de las variables de entorno de Netlify
    const secret = process.env.HCAPTCHA_SECRET;

    if (!secret) {
      console.error('HCAPTCHA_SECRET environment variable is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Server configuration error' }),
      };
    }

    // Verificar con hCaptcha
    const verificationResult = await verifyHCaptcha(token, secret);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: verificationResult.success,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Error verifying captcha:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Verification failed' }),
    };
  }
};

function verifyHCaptcha(token, secret) {
  return new Promise((resolve, reject) => {
    const postData = `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`;

    const options = {
      hostname: 'api.hcaptcha.com',
      port: 443,
      path: '/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse hCaptcha response'));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}
