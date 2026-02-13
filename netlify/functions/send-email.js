const https = require('https');

// Dominios permitidos (solo producción)
const ALLOWED_ORIGINS = [
  'https://portafolio-joao.netlify.app',
];

// Sanitizar HTML para prevenir XSS/inyección
function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validar formato de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Limitar longitud de campos
const MAX_LENGTHS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
};

// Rate limiting simple en memoria (por IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 3; // máximo 3 emails por minuto

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

  // Solo permitir POST y OPTIONS
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
    // Validar que el body exista y sea JSON válido
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

    const { name, email, subject, message } = parsed;

    // Validar campos requeridos
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing required fields' }),
      };
    }

    // Validar tipos
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid field types' }),
      };
    }

    // Validar longitudes máximas
    if (name.length > MAX_LENGTHS.name || email.length > MAX_LENGTHS.email ||
        message.length > MAX_LENGTHS.message || (subject && subject.length > MAX_LENGTHS.subject)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Field exceeds maximum length' }),
      };
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid email format' }),
      };
    }

    // Obtener las credenciales de Mailjet de las variables de entorno
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_API_SECRET;

    // Supabase config para obtener el email del perfil
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!apiKey || !apiSecret) {
      console.error('Mailjet environment variables are not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Server configuration error' }),
      };
    }

    // Obtener email del perfil en Supabase (con fallback a CONTACT_EMAIL)
    let toEmail = process.env.CONTACT_EMAIL;

    if (supabaseUrl && supabaseKey) {
      try {
        const profileEmail = await getProfileEmail(supabaseUrl, supabaseKey);
        if (profileEmail) {
          toEmail = profileEmail;
        }
      } catch (e) {
        console.error('Error fetching profile email:', e);
      }
    }

    if (!toEmail) {
      console.error('No destination email configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'No destination email configured' }),
      };
    }

    // Preparar datos para Mailjet
    const emailData = {
      Messages: [
        {
          From: {
            Email: toEmail,
            Name: 'Portafolio Contact',
          },
          To: [
            {
              Email: toEmail,
              Name: 'Joao Moreira',
            },
          ],
          ReplyTo: {
            Email: email,
            Name: name,
          },
          Subject: subject ? sanitizeHtml(subject).substring(0, 200) : `Nuevo mensaje de ${sanitizeHtml(name)} - Portafolio`,
          TextPart: `Nuevo mensaje desde tu portafolio:\n\nNombre: ${name}\nEmail: ${email}\nAsunto: ${subject || 'Sin asunto'}\n\nMensaje:\n${message}`,
          HTMLPart: `
            <h2>Nuevo mensaje desde tu portafolio</h2>
            <p><strong>Nombre:</strong> ${sanitizeHtml(name)}</p>
            <p><strong>Email:</strong> <a href="mailto:${sanitizeHtml(email)}">${sanitizeHtml(email)}</a></p>
            <p><strong>Asunto:</strong> ${sanitizeHtml(subject || 'Sin asunto')}</p>
            <hr>
            <p><strong>Mensaje:</strong></p>
            <p>${sanitizeHtml(message).replace(/\n/g, '<br>')}</p>
          `,
        },
      ],
    };

    // Enviar email usando la API de Mailjet
    const result = await sendMailjet(emailData, apiKey, apiSecret);

    if (result.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Email sent successfully',
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.error || 'Failed to send email',
        }),
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' }),
    };
  }
};

// Obtener el email del perfil desde Supabase
function getProfileEmail(supabaseUrl, supabaseKey) {
  return new Promise((resolve) => {
    const url = new URL(`${supabaseUrl}/rest/v1/profile_info`);
    url.searchParams.append('select', 'email');
    url.searchParams.append('limit', '1');

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (Array.isArray(data) && data.length > 0 && data[0].email) {
            resolve(data[0].email);
          } else {
            resolve(null);
          }
        } catch (e) {
          console.error('Parse error:', e);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      resolve(null);
    });

    req.end();
  });
}

function sendMailjet(data, apiKey, apiSecret) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(data);
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const options = {
      hostname: 'api.mailjet.com',
      port: 443,
      path: '/v3.1/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 200 && response.Messages?.[0]?.Status === 'success') {
            resolve({ success: true });
          } else {
            console.error('Mailjet error:', body);
            resolve({
              success: false,
              error: response.Messages?.[0]?.Errors?.[0]?.ErrorMessage || 'Unknown error',
            });
          }
        } catch (e) {
          console.error('Parse error:', e);
          resolve({ success: false, error: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      resolve({ success: false, error: e.message });
    });

    req.write(postData);
    req.end();
  });
}
