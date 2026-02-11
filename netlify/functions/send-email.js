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

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body);

    // Validar campos requeridos
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing required fields' }),
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
          Subject: subject || `Nuevo mensaje de ${name} - Portafolio`,
          TextPart: `Nuevo mensaje desde tu portafolio:\n\nNombre: ${name}\nEmail: ${email}\nAsunto: ${subject || 'Sin asunto'}\n\nMensaje:\n${message}`,
          HTMLPart: `
            <h2>Nuevo mensaje desde tu portafolio</h2>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
            <hr>
            <p><strong>Mensaje:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
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
