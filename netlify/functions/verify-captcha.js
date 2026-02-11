const https = require('https');

// Dominios permitidos
const ALLOWED_ORIGINS = [
  'https://portafolio-joao.netlify.app',
  'http://localhost:4200' // Para desarrollo local
];

exports.handler = async (event) => {
  // Obtener el origen de la solicitud
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

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

  try {
    const { token } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Token is required' }),
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
