const nodemailer = require('nodemailer');
const { Redis } = require('@upstash/redis');

const LIMITS = { name: 100, email: 254, subject: 160, message: 5000, company: 100 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const memoryRateLimit = new Map();

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function requestIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket?.remoteAddress || 'unknown').trim();
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const configured = (process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    return configured.includes(origin) || originUrl.host === req.headers.host;
  } catch {
    return false;
  }
}

async function checkRateLimit(req) {
  const key = `portfolio-contact:${requestIp(req)}`;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    return count <= 5;
  }
  if (process.env.VERCEL === '1') {
    throw new Error('Persistent rate limiter is not configured.');
  }

  const now = Date.now();
  const entry = memoryRateLimit.get(key);
  if (!entry || now - entry.startedAt >= 60000) {
    memoryRateLimit.set(key, { startedAt: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 5;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!originAllowed(req)) return json(res, 403, { error: 'Request origin is not allowed.' });

  let allowed;
  try {
    allowed = await checkRateLimit(req);
  } catch (error) {
    console.error('Contact rate limiter error:', error.message);
    return json(res, 503, { error: 'Contact service is temporarily unavailable.' });
  }
  if (!allowed) return json(res, 429, { error: 'Too many messages. Please wait a minute and try again.' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = clean(body.name);
  const email = clean(body.email);
  const subject = clean(body.subject);
  const message = clean(body.message);
  const company = clean(body.company);

  if (company) return json(res, 400, { error: 'Unable to process this message.' });
  if ([name, email, subject, message].some((value, index) => value.length > [LIMITS.name, LIMITS.email, LIMITS.subject, LIMITS.message][index])) {
    return json(res, 400, { error: 'One or more fields are too long.' });
  }
  if (!name || name.length < 2 || !email || !subject || !message || message.length < 10) {
    return json(res, 400, { error: 'Please complete all fields.' });
  }
  if (!EMAIL_PATTERN.test(email)) return json(res, 400, { error: 'Please enter a valid email address.' });

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Contact email credentials are not configured.');
    return json(res, 503, { error: 'Contact service is not configured.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  const submittedAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium', timeStyle: 'long', timeZone: 'UTC'
  }).format(new Date());
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\r?\n/g, '<br>')
  };

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: `Portfolio Contact Inquiry\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nSubmitted: ${submittedAt}\n\n${message}`,
      html: `<h2>Portfolio Contact Inquiry</h2><p><strong>Name:</strong> ${safe.name}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Subject:</strong> ${safe.subject}</p><p><strong>Submitted:</strong> ${submittedAt}</p><hr><p>${safe.message}</p>`
    });
  } catch (error) {
    console.error('Contact email delivery failed:', error.message);
    return json(res, 502, { error: 'Message delivery failed. Please try again later.' });
  }

  return json(res, 200, { ok: true, message: 'Message sent successfully.' });
};
