const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const argon2 = require('argon2');
const https = require('https');
const http = require('http');
const ip = require('ip');
const net = require('net');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const sanitizeHtml = require('sanitize-html');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const nodemailer = require('nodemailer');
const winston = require('winston');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const QRCode = require('qrcode');
const sharp = require('sharp');
const moment = require('moment');
const cron = require('cron');
const uuid = require('uuid');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');
const compression = require('compression');
const ExpressBrute = require('express-brute');
const MemoryStore = ExpressBrute.MemoryStore;
const csrf = require('csrf');
const speakeasy = require('speakeasy');
const NodeCache = require('node-cache');
const PasswordValidator = require('password-validator');
const useragent = require('express-useragent');
const CryptoJS = require('crypto-js');
const IpFilter = require('express-ipfilter').IpFilter;
const crypto = require('crypto');

// Initialize DOMPurify for server-side HTML sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Security Configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

// Password validation schema
const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(12)                                    // Minimum length 12
  .is().max(128)                                   // Maximum length 128
  .has().uppercase()                               // Must have uppercase letters
  .has().lowercase()                               // Must have lowercase letters
  .has().digits(2)                                 // Must have at least 2 digits
  .has().symbols(1)                                // Must have at least 1 symbol
  .has().not().spaces()                            // Should not have spaces
  .is().not().oneOf(['password', '123456789', 'qwerty']); // Blacklist common passwords

// Security cache for failed attempts and blacklists
const securityCache = new NodeCache({
  stdTTL: 3600, // 1 hour default TTL
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false
});

// Brute force protection store
const bruteForceStore = new MemoryStore();

// CSRF protection
const csrfProtection = csrf({ secret: CSRF_SECRET });

// Rate limiting configurations - Very permissive for development
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Very high limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return req.ip + ':' + (req.session.user?.id || 'anonymous');
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: (req) => req.ip
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // Limit each IP to 2 registrations per hour
  message: {
    error: 'Too many registration attempts, please try again later.',
    retryAfter: '1 hour'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'API rate limit exceeded',
    retryAfter: '15 minutes'
  }
});

// Slow down middleware for progressive delays
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5, // allow 5 requests per windowMs without delay
  delayMs: () => 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // max delay of 20 seconds
});

// Brute force protection
const bruteForce = new ExpressBrute(bruteForceStore, {
  freeRetries: 3,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  lifetime: 24 * 60 * 60, // 1 day (in seconds)
  failCallback: function (req, res, next, nextValidRequestDate) {
    logger.warn(`Brute force attack detected from IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many failed attempts, account temporarily locked',
      nextValidRequestDate: nextValidRequestDate
    });
  }
});

// Enhanced logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'velink' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

const app = express();

// Content Security Policy - More permissive for development
const cspConfig = {
  directives: {
    defaultSrc: ["'self'", "localhost:*", "127.0.0.1:*"],
    styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:", "localhost:*", "127.0.0.1:*"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:", "localhost:*", "127.0.0.1:*"],
    imgSrc: ["'self'", "data:", "https:", "http:", "blob:", "localhost:*", "127.0.0.1:*"],
    fontSrc: ["'self'", "https:", "http:", "data:", "localhost:*", "127.0.0.1:*"],
    connectSrc: ["'self'", "https:", "http:", "ws:", "wss:", "localhost:*", "127.0.0.1:*"],
    frameSrc: ["'self'", "https:", "http:", "localhost:*", "127.0.0.1:*"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'", "https:", "http:", "localhost:*", "127.0.0.1:*"],
    manifestSrc: ["'self'", "localhost:*", "127.0.0.1:*"],
    baseUri: ["'self'"],
    formAction: ["'self'", "localhost:*", "127.0.0.1:*"]
  }
};

// Security Middleware Configuration - DISABLED for development
// app.use(helmet({
//   contentSecurityPolicy: false, // Disabled for development
//   hsts: false, // Disabled for HTTP development
//   noSniff: true,
//   frameguard: { action: 'deny' },
//   referrerPolicy: { policy: 'no-referrer' }
// }));

app.use(compression());
// CORS disabled for development 
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' ? 
//     (process.env.ALLOWED_ORIGINS?.split(',') || ['https://velink.me']) : 
//     ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:*', 'http://127.0.0.1:*'],
//   credentials: true,
//   optionsSuccessStatus: 200
// }));

// Security middleware DISABLED for development
// app.use(mongoSanitize({
//   replaceWith: '_',
//   onSanitize: ({ req, key }) => {
//     logger.warn(`Sanitized key ${key} from IP ${req.ip}`);
//   }
// }));

// app.use(hpp({
//   whitelist: ['sort', 'filter', 'page']
// }));

app.use(useragent.express());

// Advanced security middleware DISABLED for development
// app.use((req, res, next) => {
//   // Detect and log threats
//   const threats = detectThreats(req);
//   if (threats.length > 0) {
//     logger.warn(`Security threats detected from IP ${req.ip}: ${threats.join(', ')}`);
//     
//     // Block obvious attacks
//     if (threats.includes('SQL_INJECTION') || threats.includes('XSS_ATTEMPT')) {
//       return res.status(403).json({ error: 'Request blocked for security reasons' });
//     }
//   }
//   
//   // Check IP reputation
//   if (checkIPReputation(req.ip)) {
//     logger.warn(`Malicious IP detected: ${req.ip}`);
//     return res.status(403).json({ error: 'Access denied' });
//   }
//   
//   // Sanitize request body
//   if (req.body && typeof req.body === 'object') {
//     req.body = sanitizeObject(req.body);
//   }
//   
//   // Add security headers
//   res.setHeader('X-Frame-Options', 'DENY');
//   res.setHeader('X-Content-Type-Options', 'nosniff');
//   res.setHeader('Referrer-Policy', 'no-referrer');
//   res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
//   res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
//   res.setHeader('Pragma', 'no-cache');
//   res.setHeader('Expires', '0');
//   
//   next();
// });

app.use(express.static('public', {
  setHeaders: (res, path) => {
    // Security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Enhanced session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'ultrageheimes_sitzungsgeheimnis_!123_enhanced',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
  name: 'velink_session'
}));

// Cookie consent tracking
app.use((req, res, next) => {
  if (!req.cookies.cookie_consent) {
    res.locals.showCookieNotice = true;
  }
  res.locals.cookieConsent = req.cookies.cookie_consent === 'accepted';
  next();
});

// Enhanced rate limiting with different rules
// Advanced input sanitization functions
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove null bytes and control characters
  input = input.replace(/\x00/g, '');
  input = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // HTML sanitization
  input = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Additional SQL injection protection
  input = input.replace(/['"`;\\]/g, '');
  
  return validator.escape(input);
}

function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = typeof obj[key] === 'string' ? sanitizeInput(obj[key]) : obj[key];
    }
  }
  return sanitized;
}

// Advanced threat detection
function detectThreats(req) {
  const threats = [];
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers.referer || '';
  
  // SQL injection patterns
  const sqlPatterns = [
    /(\s|^)(union|select|insert|delete|update|drop|create|alter|exec|execute)\s/i,
    /(\s|^)(or|and)\s+\d+\s*=\s*\d+/i,
    /['"]?\s*(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i,
    /(\s|^)(script|javascript|vbscript|onload|onerror|onclick)/i
  ];
  
  // XSS patterns
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi
  ];
  
  // Check request body
  const bodyStr = JSON.stringify(req.body);
  sqlPatterns.forEach(pattern => {
    if (pattern.test(bodyStr)) threats.push('SQL_INJECTION');
  });
  
  xssPatterns.forEach(pattern => {
    if (pattern.test(bodyStr)) threats.push('XSS_ATTEMPT');
  });
  
  // Check for bot/scanner signatures
  const botPatterns = [
    /sqlmap/i, /nmap/i, /masscan/i, /zap/i, /burp/i, /nikto/i,
    /python-requests/i, /curl/i, /wget/i, /scanner/i
  ];
  
  botPatterns.forEach(pattern => {
    if (pattern.test(userAgent)) threats.push('BOT_DETECTED');
  });
  
  // Check for suspicious headers
  if (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').length > 5) {
    threats.push('PROXY_CHAIN');
  }
  
  return threats;
}

// IP reputation checking
function checkIPReputation(ip) {
  // Check against known malicious IP ranges
  const maliciousRanges = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ];
  
  // Add your IP reputation service here
  return false; // Return true if IP is malicious
}

// Enhanced session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'ultrageheimes_sitzungsgeheimnis_!123_enhanced',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
  name: 'velink_session'
}));

app.set('trust proxy', 1);

app.disable('x-powered-by');

const CERT_DIR = '/etc/letsencrypt/live/velink.me';
const KEY_PATH = path.join(CERT_DIR, 'privkey.pem');
const CERT_PATH = path.join(CERT_DIR, 'fullchain.pem');

function certificatesExist() {
  try {
    return fs.existsSync(KEY_PATH) && fs.existsSync(CERT_PATH);
  } catch {
    return false;
  }
}

if (certificatesExist()) {
  console.log('Zertifikate gefunden, starte HTTPS-Server...');
  const options = {
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
  };

  https.createServer(options, app).listen(443, '0.0.0.0', () => {
    console.log('HTTPS-Server läuft auf Port 443');
  });
} else {
  console.log('Keine Zertifikate gefunden, starte HTTP-Server auf Port 8000...');
  http.createServer(app).listen(8000, '0.0.0.0', () => {
    console.log('HTTP-Server läuft auf Port 8000');
  });
}

const whitelist = ["88.45.1.255"];
const isWhitelistActive = false;

function isWhitelisted(ipAddress) {
  if (!ip.isV4Format(ipAddress) && !ip.isV6Format(ipAddress)) {
    return false;
  }

  for (const entry of whitelist) {
    if (entry.includes('/')) {
      if (ip.cidrSubnet(entry).contains(ipAddress)) {
        return true;
      }
    } else {
      if (ipAddress === entry) {
        return true;
      }
    }
  }
  return false;
}

function ipWhitelist(req, res, next) {
  if (!isWhitelistActive) {
    return next();
  }

  let clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim();

  if (!clientIp || !net.isIP(clientIp)) {
    clientIp = req.ip;
  }

  if (isWhitelisted(clientIp)) {
    return next();
  } else {
    const err = new Error('Access denied: This IP address is not allowed.');
    err.status = 403;
    console.warn(`Blocked IP: ${clientIp}`);
    return next(err);
  }
}

module.exports = ipWhitelist;

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    logger.error('Database connection error:', err.message);
  } else {
    logger.info('📦 SQLite3 Database connected successfully');
  }
});

// Enhanced comprehensive database schema
const createTables = () => {
  // Enhanced users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    verified INTEGER DEFAULT 0,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active INTEGER DEFAULT 1,
    is_banned INTEGER DEFAULT 0,
    ban_reason TEXT,
    ban_expires DATETIME,
    login_attempts INTEGER DEFAULT 0,
    last_attempt DATETIME,
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    backup_codes TEXT,
    subscription_type TEXT DEFAULT 'free',
    subscription_expires DATETIME,
    total_visits INTEGER DEFAULT 0,
    api_key TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    notifications_enabled INTEGER DEFAULT 1,
    email_notifications INTEGER DEFAULT 1,
    privacy_level TEXT DEFAULT 'public'
  )`);

  // Enhanced links table
  db.run(`CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    thumbnail TEXT,
    position INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    scheduled_start DATETIME,
    scheduled_end DATETIME,
    link_type TEXT DEFAULT 'external',
    category TEXT,
    tags TEXT,
    click_limit INTEGER,
    password_protected INTEGER DEFAULT 0,
    password TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Enhanced analytics table
  db.run(`CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    link_id INTEGER,
    visitor_id TEXT,
    session_id TEXT,
    visitor_ip TEXT,
    user_agent TEXT,
    browser TEXT,
    os TEXT,
    device TEXT,
    referrer TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    is_unique INTEGER DEFAULT 0,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE
  )`);

  // User warnings and moderation
  db.run(`CREATE TABLE IF NOT EXISTS user_warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    warning_type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity INTEGER DEFAULT 1,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(admin_id) REFERENCES users(id)
  )`);

  // Email logs
  db.run(`CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    status TEXT DEFAULT 'pending',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // User sessions for tracking
  db.run(`CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Profile views tracking
  db.run(`CREATE TABLE IF NOT EXISTS profile_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    visitor_id TEXT,
    visitor_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // User preferences and settings
  db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    show_analytics INTEGER DEFAULT 1,
    allow_indexing INTEGER DEFAULT 1,
    show_visitor_count INTEGER DEFAULT 1,
    enable_link_preview INTEGER DEFAULT 1,
    custom_tracking_code TEXT,
    google_analytics_id TEXT,
    facebook_pixel_id TEXT,
    dark_mode INTEGER DEFAULT 0,
    compact_mode INTEGER DEFAULT 0,
    animation_enabled INTEGER DEFAULT 1,
    sound_enabled INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // QR codes for profiles
  db.run(`CREATE TABLE IF NOT EXISTS qr_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code_type TEXT DEFAULT 'profile',
    qr_data TEXT NOT NULL,
    file_path TEXT,
    downloads INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Link thumbnails and metadata
  db.run(`CREATE TABLE IF NOT EXISTS link_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    favicon_url TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE
  )`);

  // User uploads (avatars, thumbnails, etc.)
  db.run(`CREATE TABLE IF NOT EXISTS user_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Enhanced admin logs
  db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_user_id INTEGER,
    target_type TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    severity TEXT DEFAULT 'info',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES users(id),
    FOREIGN KEY(target_user_id) REFERENCES users(id)
  )`);

  // System notifications
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    action_url TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Link groups/categories
  db.run(`CREATE TABLE IF NOT EXISTS link_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'folder',
    position INTEGER DEFAULT 0,
    is_expanded INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // A/B testing for links
  db.run(`CREATE TABLE IF NOT EXISTS ab_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    variant_a_link_id INTEGER,
    variant_b_link_id INTEGER,
    traffic_split INTEGER DEFAULT 50,
    is_active INTEGER DEFAULT 1,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    conversion_goal TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(variant_a_link_id) REFERENCES links(id),
    FOREIGN KEY(variant_b_link_id) REFERENCES links(id)
  )`);

  logger.info('📊 All database tables created successfully');
};

createTables();

const profileDB = new sqlite3.Database('./profiles.db', (err) => {
  if (err) console.error('Profil-DB-Fehler:', err.message);
  else console.log('📦 SQLite3-Profil-Datenbank verbunden');
});

// Enhanced profiles table
profileDB.run(`CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY,
  bio TEXT,
  avatar TEXT,
  display_name TEXT,
  location TEXT,
  website TEXT,
  social_links TEXT, -- JSON string
  theme TEXT DEFAULT 'default',
  custom_css TEXT,
  custom_domain TEXT,
  profile_views INTEGER DEFAULT 0,
  is_premium INTEGER DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Add missing columns to existing profiles
profileDB.run(`ALTER TABLE profiles ADD COLUMN display_name TEXT`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN location TEXT`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN website TEXT`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN social_links TEXT`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN theme TEXT DEFAULT 'default'`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN custom_css TEXT`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN custom_domain TEXT`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN profile_views INTEGER DEFAULT 0`, () => {});
profileDB.run(`ALTER TABLE profiles ADD COLUMN is_premium INTEGER DEFAULT 0`, () => {});

profileDB.run(`ALTER TABLE profiles ADD COLUMN visits TEXT DEFAULT ''`, (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.error('Fehler beim Hinzufügen der visits-Spalte:', err.message);
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Temporarily disable strict rate limiting for development
// app.use(strictLimiter);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const MIN_RESPONSE_TIME = 500;

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('error', {
    errorCode: 403,
    errorMessage: 'Access denied. Admin privileges required.'
  });
}

function isModerator(req, res, next) {
  if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'moderator')) {
    return next();
  }
  res.status(403).render('error', {
    errorCode: 403,
    errorMessage: 'Access denied. Moderator privileges required.'
  });
}

// Utility function to log admin actions
function logAdminAction(adminId, action, targetUserId = null, details = null, ipAddress = null) {
  db.run(
    "INSERT INTO admin_logs (admin_id, action, target_user_id, details, ip_address) VALUES (?, ?, ?, ?, ?)",
    [adminId, action, targetUserId, details, ipAddress],
    (err) => {
      if (err) console.error('Error logging admin action:', err.message);
    }
  );
}

app.get('/', (req, res) => {
  const username = req.session.user ? req.session.user.username : null;
  const from = req.query.from;
  res.render('start', { user: req.session.user, username, from });
});

app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');

  db.all("SELECT username FROM users", (err, rows) => {
    if (err) {
      return res.status(500).send('Fehler beim Erstellen der Sitemap');
    }

    const urls = rows.map(user => `
      <url>
        <loc>https://velink.me/profile/${user.username}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://velink.me/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://velink.me/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://velink.me/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ${urls}
</urlset>`;

    res.send(sitemap);
  });
});

app.get('/register', ipWhitelist, (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', ipWhitelist, registrationLimiter, speedLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  const start = Date.now();

  // Enhanced input validation
  if (!username || !email || !password) {
    return res.render('register', { error: 'Alle Felder ausfüllen.' });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.render('register', { error: 'Ungültige E-Mail-Adresse.' });
  }

  // Validate username
  if (!validator.isAlphanumeric(username) || username.length < 3 || username.length > 30) {
    return res.render('register', { error: 'Benutzername muss 3-30 alphanumerische Zeichen enthalten.' });
  }

  // Validate password strength
  const passwordValidation = passwordSchema.validate(password, { list: true });
  if (passwordValidation.length > 0) {
    return res.render('register', { 
      error: 'Passwort muss mindestens 12 Zeichen, Groß-/Kleinbuchstaben, 2 Ziffern und 1 Symbol enthalten.' 
    });
  }

  // Sanitize inputs
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedEmail = sanitizeInput(email);

  try {
    db.get("SELECT id FROM users WHERE username = ? OR email = ?", [sanitizedUsername, sanitizedEmail], async (err, user) => {
      if (err) {
        logger.error('Database error during registration:', err);
        return res.render('register', { error: 'Interner Fehler.' });
      }

      if (user) {
        const elapsed = Date.now() - start;
        if (elapsed < MIN_RESPONSE_TIME) await delay(MIN_RESPONSE_TIME - elapsed);
        return res.render('register', { error: 'Registrierung nicht möglich.' });
      }

      // Use Argon2 for enhanced password hashing
      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      });
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // First user becomes admin
      db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
        const role = (result && result.count === 0) ? 'admin' : 'user';
        
        db.run(`
          INSERT INTO users (
            username, email, password, role, verification_token, 
            created_at, api_key
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
          [sanitizedUsername, sanitizedEmail, hashedPassword, role, verificationToken, uuid.v4()],
          function (err) {
            if (err) {
              logger.error('Error creating user:', err);
              return res.render('register', { error: 'Registrierung nicht möglich.' });
            }

            const userId = this.lastID;
            
            // Create user profile
            profileDB.run(`
              INSERT INTO profiles (user_id, bio, avatar, display_name, theme) 
              VALUES (?, ?, ?, ?, ?)`,
              [userId, '', 'default.png', sanitizedUsername, 'default'], 
              (err) => {
                if (err) console.error('Profil konnte nicht angelegt werden:', err.message);
              }
            );

            // Create user preferences
            db.run(`
              INSERT INTO user_preferences (user_id) VALUES (?)`,
              [userId]
            );

            // Log registration
            logger.info(`New user registered: ${sanitizedUsername} from IP: ${req.ip}`);

            req.session.user = { 
              id: userId, 
              username: sanitizedUsername, 
              email: sanitizedEmail, 
              role 
            };
            res.redirect(`/?from=register`);
          });
      });
    });
  } catch (e) {
    logger.error('Registration error:', e);
    res.render('register', { error: 'Interner Fehler. Bitte später versuchen.' });
  }
});

app.get('/login', ipWhitelist, (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', ipWhitelist, loginLimiter, bruteForce.prevent, speedLimiter, async (req, res) => {
  const { username, password, totp } = req.body;
  const start = Date.now();
  const clientIP = req.ip;

  // Enhanced input validation
  if (!username || !password) {
    return res.render('login', { error: 'Alle Felder ausfüllen.' });
  }

  const sanitizedUsername = sanitizeInput(username);

  // Check for account lockout
  const lockoutKey = `lockout:${clientIP}:${sanitizedUsername}`;
  const lockoutCount = securityCache.get(lockoutKey) || 0;
  
  if (lockoutCount >= 5) {
    logger.warn(`Account lockout triggered for ${sanitizedUsername} from IP ${clientIP}`);
    return res.render('login', { 
      error: 'Konto temporär gesperrt aufgrund zu vieler fehlgeschlagener Anmeldeversuche.' 
    });
  }

  db.get("SELECT * FROM users WHERE username = ?", [sanitizedUsername], async (err, user) => {
    let valid = false;
    let require2FA = false;

    if (user && !err && user.is_active && !user.is_banned) {
      try {
        // Check if account is temporarily banned
        if (user.ban_expires && new Date(user.ban_expires) > new Date()) {
          const elapsed = Date.now() - start;
          if (elapsed < MIN_RESPONSE_TIME) await delay(MIN_RESPONSE_TIME - elapsed);
          return res.render('login', { error: 'Konto ist temporär gesperrt.' });
        }

        // Verify password with Argon2 (fallback to bcrypt for existing users)
        if (user.password.startsWith('$argon2')) {
          valid = await argon2.verify(user.password, password);
        } else {
          // Legacy bcrypt verification, upgrade to Argon2
          valid = await bcrypt.compare(password, user.password);
          if (valid) {
            const newHash = await argon2.hash(password, {
              type: argon2.argon2id,
              memoryCost: 2 ** 16,
              timeCost: 3,
              parallelism: 1,
            });
            db.run("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id]);
          }
        }

        // Check 2FA if enabled
        if (valid && user.two_factor_enabled) {
          require2FA = true;
          if (!totp) {
            return res.render('login', { 
              error: 'Zwei-Faktor-Authentifizierung erforderlich.',
              require2FA: true,
              username: sanitizedUsername 
            });
          }
          
          const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: totp,
            window: 2
          });
          
          if (!verified) {
            valid = false;
          }
        }
      } catch (error) {
        logger.error('Password verification error:', error);
        valid = false;
      }
    }

    const elapsed = Date.now() - start;
    if (elapsed < MIN_RESPONSE_TIME) {
      await delay(MIN_RESPONSE_TIME - elapsed);
    }

    if (!user || !valid || !user.is_active || user.is_banned) {
      // Increment failed attempt counter
      securityCache.set(lockoutKey, lockoutCount + 1, 1800); // 30 minutes
      
      // Update user login attempts
      if (user) {
        db.run(`
          UPDATE users SET 
            login_attempts = login_attempts + 1, 
            last_attempt = CURRENT_TIMESTAMP 
          WHERE id = ?`, [user.id]);
      }

      logger.warn(`Failed login attempt for ${sanitizedUsername} from IP ${clientIP}`);
      return res.render('login', { error: 'Ungültige Anmeldedaten.' });
    }

    // Clear failed attempts on successful login
    securityCache.del(lockoutKey);

    // Update last login and reset failed attempts
    db.run(`
      UPDATE users SET 
        last_login = CURRENT_TIMESTAMP, 
        login_attempts = 0 
      WHERE id = ?`, [user.id]);

    // Create session tracking
    const sessionId = uuid.v4();
    db.run(`
      INSERT INTO user_sessions (user_id, session_id, ip_address, user_agent) 
      VALUES (?, ?, ?, ?)`,
      [user.id, sessionId, clientIP, req.headers['user-agent'] || '']
    );

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId: sessionId
    };
    
    logger.info(`Successful login for ${user.username} from IP ${clientIP}`);
    
    // Redirect admins to admin dashboard
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect(`/?from=login`);
    }
  });
});

app.get('/logout', ipWhitelist, (req, res) => {
  if (!req.session) {
    return res.redirect('/');
  }

  req.session.destroy(err => {
    if (err) {
      console.error('Fehler beim Logout:', err.message);
      return res.redirect('/?error=session');
    }

    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.redirect('/?from=logout');
  });
});

app.get('/profile/:username', async (req, res) => {
  const start = Date.now();
  const requestedUsername = req.params.username;
  const loggedInUser = req.session?.user;
  const isOwnProfile = loggedInUser && loggedInUser.username === requestedUsername;

  let user = null;
  let profile = {
    bio: '',
    avatar: '/img/default.png',
    display_name: '',
    location: '',
    website: '',
    theme: 'default'
  };
  let links = [];

  try {
    user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ?", [requestedUsername], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (user) {
      // Get profile data
      const profileData = await new Promise((resolve, reject) => {
        profileDB.get("SELECT * FROM profiles WHERE user_id = ?", [user.id], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      if (profileData) {
        profile = {
          bio: profileData.bio || '',
          avatar: profileData.avatar || '/img/default.png',
          display_name: profileData.display_name || user.username,
          location: profileData.location || '',
          website: profileData.website || '',
          theme: profileData.theme || 'default',
          custom_css: profileData.custom_css || ''
        };
      }

      // Get user's active links
      links = await new Promise((resolve, reject) => {
        db.all(
          "SELECT * FROM links WHERE user_id = ? AND is_active = 1 ORDER BY position ASC",
          [user.id],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
          }
        );
      });

      // Update profile views (only if not own profile)
      if (!isOwnProfile) {
        profileDB.run(
          "UPDATE profiles SET profile_views = profile_views + 1 WHERE user_id = ?",
          [user.id]
        );
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden des Profils:', error);
  }

  const elapsed = Date.now() - start;
  if (elapsed < MIN_RESPONSE_TIME) {
    await delay(MIN_RESPONSE_TIME - elapsed);
  }

  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  if (!user) {
    return res.status(404).render('profile', {
      username: requestedUsername,
      email: '',
      isOwnProfile: false,
      profile: {
        bio: 'Profil nicht gefunden.',
        avatar: '/img/default.png',
        display_name: requestedUsername,
        theme: 'default'
      },
      links: [],
      user: loggedInUser,
      url: fullUrl
    });
  }

  res.render('profile', {
    username: user.username,
    email: user.email,
    isOwnProfile,
    profile,
    links,
    user: loggedInUser,
    url: fullUrl
  });
});

// Link click tracking and redirect
app.get('/l/:linkId', (req, res) => {
  const linkId = req.params.linkId;
  const geoip = require('geoip-lite');
  
  db.get("SELECT * FROM links WHERE id = ? AND is_active = 1", [linkId], (err, link) => {
    if (err || !link) {
      return res.status(404).send('Link not found');
    }
    
    // Track the click
    const visitorIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    const geo = geoip.lookup(visitorIp);
    const country = geo ? geo.country : 'Unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || '';
    
    // Insert analytics record
    db.run(
      `INSERT INTO analytics (user_id, link_id, visitor_ip, user_agent, referrer, country) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [link.user_id, linkId, visitorIp, userAgent, referrer, country]
    );
    
    // Increment link clicks
    db.run("UPDATE links SET clicks = clicks + 1 WHERE id = ?", [linkId]);
    
    // Redirect to the actual URL
    res.redirect(link.url);
  });
});



// === ADMIN ROUTES ===

// Admin Dashboard
app.get('/admin', isAdmin, (req, res) => {
  const user = req.session.user;
  
  // Get system statistics
  Promise.all([
    new Promise((resolve) => db.get("SELECT COUNT(*) as count FROM users", (err, row) => resolve(row?.count || 0))),
    new Promise((resolve) => db.get("SELECT COUNT(*) as count FROM users WHERE created_at >= date('now', '-30 days')", (err, row) => resolve(row?.count || 0))),
    new Promise((resolve) => db.get("SELECT COUNT(*) as count FROM links", (err, row) => resolve(row?.count || 0))),
    new Promise((resolve) => db.get("SELECT COUNT(*) as count FROM analytics WHERE clicked_at >= date('now', '-30 days')", (err, row) => resolve(row?.count || 0))),
    new Promise((resolve) => profileDB.get("SELECT SUM(profile_views) as views FROM profiles", (err, row) => resolve(row?.views || 0)))
  ]).then(([totalUsers, newUsers, totalLinks, recentClicks, totalViews]) => {
    res.render('admin/dashboard', {
      user,
      stats: {
        totalUsers,
        newUsers,
        totalLinks,
        recentClicks,
        totalViews
      }
    });
  });
});

// Admin User Management
app.get('/admin/users', isAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  db.all(
    "SELECT id, username, email, role, verified, is_active, created_at, last_login FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limit, offset],
    (err, users) => {
      if (err) return res.status(500).send('Database error');
      
      db.get("SELECT COUNT(*) as count FROM users", (err, countResult) => {
        const totalUsers = countResult?.count || 0;
        const totalPages = Math.ceil(totalUsers / limit);
        
        res.render('admin/users', {
          user: req.session.user,
          users,
          currentPage: page,
          totalPages,
          totalUsers
        });
      });
    }
  );
});

// Admin User Edit
app.get('/admin/users/:id/edit', isAdmin, (req, res) => {
  const userId = req.params.id;
  const success = req.query.success;
  const error = req.query.error;
  
  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) return res.status(404).send('User not found');
    
    // Get user statistics
    Promise.all([
      // Get profile data
      new Promise((resolve) => {
        profileDB.get("SELECT * FROM profiles WHERE user_id = ?", [userId], (err, profile) => {
          resolve(profile || {});
        });
      }),
      // Get links count
      new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM links WHERE user_id = ?", [userId], (err, result) => {
          resolve(result ? result.count : 0);
        });
      }),
      // Get total clicks
      new Promise((resolve) => {
        db.get("SELECT SUM(clicks) as total FROM links WHERE user_id = ?", [userId], (err, result) => {
          resolve(result ? result.total || 0 : 0);
        });
      }),
      // Get profile views
      new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM profile_views WHERE user_id = ?", [userId], (err, result) => {
          resolve(result ? result.count : 0);
        });
      }),
      // Get warnings count
      new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM user_warnings WHERE user_id = ?", [userId], (err, result) => {
          resolve(result ? result.count : 0);
        });
      })
    ]).then(([profile, linksCount, totalClicks, profileViews, warningsCount]) => {
      res.render('admin/user-edit', {
        user: req.session.user,
        targetUser: user,
        profile,
        linksCount,
        totalClicks,
        profileViews,
        warningsCount,
        success,
        error
      });
    });
  });
});

// Admin User Update
app.post('/admin/users/:id/update', isAdmin, (req, res) => {
  const userId = req.params.id;
  const { username, email, role, is_active, verified } = req.body;
  const adminUser = req.session.user;
  
  db.run(
    "UPDATE users SET username = ?, email = ?, role = ?, is_active = ?, verified = ? WHERE id = ?",
    [username, email, role, is_active ? 1 : 0, verified ? 1 : 0, userId],
    (err) => {
      if (err) return res.status(500).send('Database error');
      
      logAdminAction(adminUser.id, 'USER_UPDATE', userId, 
        `Updated user: ${username}`, req.ip);
      
      res.redirect('/admin/users');
    }
  );
});

// Admin User Delete
app.post('/admin/users/:id/delete', isAdmin, (req, res) => {
  const userId = req.params.id;
  const adminUser = req.session.user;
  
  // Don't allow deleting yourself
  if (userId == adminUser.id) {
    return res.status(400).send('Cannot delete your own account');
  }
  
  db.get("SELECT username FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) return res.status(404).send('User not found');
    
    // Delete user and related data
    db.serialize(() => {
      db.run("DELETE FROM analytics WHERE user_id = ?", [userId]);
      db.run("DELETE FROM links WHERE user_id = ?", [userId]);
      profileDB.run("DELETE FROM profiles WHERE user_id = ?", [userId]);
      db.run("DELETE FROM users WHERE id = ?", [userId], (err) => {
        if (err) return res.status(500).send('Database error');
        
        logAdminAction(adminUser.id, 'USER_DELETE', userId, 
          `Deleted user: ${user.username}`, req.ip);
        
        res.redirect('/admin/users');
      });
    });
  });
});

// Admin Analytics
app.get('/admin/analytics', isAdmin, (req, res) => {
  const timeframe = req.query.timeframe || '30days';
  let dateFilter = '';
  
  switch(timeframe) {
    case '7days':
      dateFilter = "WHERE clicked_at >= date('now', '-7 days')";
      break;
    case '30days':
      dateFilter = "WHERE clicked_at >= date('now', '-30 days')";
      break;
    case '90days':
      dateFilter = "WHERE clicked_at >= date('now', '-90 days')";
      break;
    default:
      dateFilter = "WHERE clicked_at >= date('now', '-30 days')";
  }
  
  Promise.all([
    new Promise((resolve) => 
      db.all(`SELECT DATE(clicked_at) as date, COUNT(*) as clicks 
              FROM analytics ${dateFilter} 
              GROUP BY DATE(clicked_at) 
              ORDER BY date DESC`, (err, rows) => resolve(rows || []))),
    new Promise((resolve) => 
      db.all(`SELECT country, COUNT(*) as count 
              FROM analytics ${dateFilter} 
              GROUP BY country 
              ORDER BY count DESC LIMIT 10`, (err, rows) => resolve(rows || []))),
    new Promise((resolve) => 
      db.all(`SELECT referrer, COUNT(*) as count 
              FROM analytics ${dateFilter} 
              GROUP BY referrer 
              ORDER BY count DESC LIMIT 10`, (err, rows) => resolve(rows || [])))
  ]).then(([dailyClicks, topCountries, topReferrers]) => {
    res.render('admin/analytics', {
      user: req.session.user,
      timeframe,
      dailyClicks,
      topCountries,
      topReferrers
    });
  });
});

// Admin Logs
app.get('/admin/logs', isAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  
  db.all(
    `SELECT al.*, u.username as admin_username, tu.username as target_username 
     FROM admin_logs al 
     LEFT JOIN users u ON al.admin_id = u.id 
     LEFT JOIN users tu ON al.target_user_id = tu.id 
     ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, logs) => {
      if (err) return res.status(500).send('Database error');
      
      res.render('admin/logs', {
        user: req.session.user,
        logs,
        currentPage: page
      });
    }
  );
});

// Admin User Ban/Unban
app.post('/admin/users/:id/ban', isAdmin, (req, res) => {
  const userId = req.params.id;
  const { reason, duration } = req.body;
  const adminUser = req.session.user;
  
  if (userId == adminUser.id) {
    return res.status(400).send('Cannot ban your own account');
  }
  
  let banExpires = null;
  if (duration && duration !== 'permanent') {
    const days = parseInt(duration);
    banExpires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }
  
  db.run(
    "UPDATE users SET is_banned = 1, ban_reason = ?, ban_expires = ? WHERE id = ?",
    [reason || 'No reason provided', banExpires, userId],
    (err) => {
      if (err) return res.status(500).send('Database error');
      
      logAdminAction(adminUser.id, 'USER_BAN', userId, 
        `Banned user. Reason: ${reason}. Duration: ${duration || 'permanent'}`, req.ip);
      
      res.redirect(`/admin/users/${userId}/edit?success=banned`);
    }
  );
});

app.post('/admin/users/:id/unban', isAdmin, (req, res) => {
  const userId = req.params.id;
  const adminUser = req.session.user;
  
  db.run(
    "UPDATE users SET is_banned = 0, ban_reason = NULL, ban_expires = NULL WHERE id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).send('Database error');
      
      logAdminAction(adminUser.id, 'USER_UNBAN', userId, 'Unbanned user', req.ip);
      
      res.redirect(`/admin/users/${userId}/edit?success=unbanned`);
    }
  );
});

// Admin User Activate/Deactivate
app.post('/admin/users/:id/activate', isAdmin, (req, res) => {
  const userId = req.params.id;
  const adminUser = req.session.user;
  
  db.run(
    "UPDATE users SET is_active = 1 WHERE id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).send('Database error');
      
      logAdminAction(adminUser.id, 'USER_ACTIVATE', userId, 'Activated user account', req.ip);
      
      res.redirect(`/admin/users/${userId}/edit?success=activated`);
    }
  );
});

app.post('/admin/users/:id/deactivate', isAdmin, (req, res) => {
  const userId = req.params.id;
  const adminUser = req.session.user;
  
  if (userId == adminUser.id) {
    return res.status(400).send('Cannot deactivate your own account');
  }
  
  db.run(
    "UPDATE users SET is_active = 0 WHERE id = ?",
    [userId],
    (err) => {
      if (err) return res.status(500).send('Database error');
      
      logAdminAction(adminUser.id, 'USER_DEACTIVATE', userId, 'Deactivated user account', req.ip);
      
      res.redirect(`/admin/users/${userId}/edit?success=deactivated`);
    }
  );
});

// Admin Warning System
app.post('/admin/users/:id/warn', isAdmin, (req, res) => {
  const userId = req.params.id;
  const { message, severity, warningType } = req.body;
  const adminUser = req.session.user;
  
  if (!message) {
    return res.status(400).send('Warning message is required');
  }
  
  db.run(
    "INSERT INTO user_warnings (user_id, admin_id, warning_type, message, severity) VALUES (?, ?, ?, ?, ?)",
    [userId, adminUser.id, warningType || 'general', message, severity || 1],
    (err) => {
      if (err) return res.status(500).send('Database error');
      
      // Also create a notification for the user
      db.run(
        "INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)",
        [userId, 'warning', 'Warning Received', message]
      );
      
      logAdminAction(adminUser.id, 'USER_WARN', userId, 
        `Warning issued: ${message}`, req.ip);
      
      res.redirect(`/admin/users/${userId}/edit?success=warned`);
    }
  );
});

// Admin Email System
app.post('/admin/users/:id/email', isAdmin, (req, res) => {
  const userId = req.params.id;
  const { subject, message, emailType } = req.body;
  const adminUser = req.session.user;
  
  if (!subject || !message) {
    return res.status(400).send('Subject and message are required');
  }
  
  // Get user's email
  db.get("SELECT email, username FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) return res.status(404).send('User not found');
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@velink.me',
      to: user.email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6366f1; color: white; padding: 20px; text-align: center;">
            <h1>VeLink</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2>Hello ${user.username},</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This message was sent by an administrator of VeLink.
            </p>
          </div>
        </div>
      `
    };
    
    emailTransporter.sendMail(mailOptions, (error, info) => {
      const status = error ? 'failed' : 'sent';
      const errorMsg = error ? error.message : null;
      
      // Log email attempt
      db.run(
        "INSERT INTO email_logs (user_id, email_type, recipient_email, subject, status, error_message) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, emailType || 'admin_message', user.email, subject, status, errorMsg]
      );
      
      logAdminAction(adminUser.id, 'EMAIL_SENT', userId, 
        `Email sent to ${user.email}. Subject: ${subject}`, req.ip);
      
      if (error) {
        res.redirect(`/admin/users/${userId}/edit?error=email_failed`);
      } else {
        res.redirect(`/admin/users/${userId}/edit?success=email_sent`);
      }
    });
  });
});

// Admin Bulk Actions
app.post('/admin/users/bulk-action', isAdmin, (req, res) => {
  const { action, userIds } = req.body;
  const adminUser = req.session.user;
  
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).send('No users selected');
  }
  
  const placeholders = userIds.map(() => '?').join(',');
  
  switch (action) {
    case 'deactivate':
      db.run(
        `UPDATE users SET is_active = 0 WHERE id IN (${placeholders}) AND id != ?`,
        [...userIds, adminUser.id],
        (err) => {
          if (err) return res.status(500).send('Database error');
          logAdminAction(adminUser.id, 'BULK_DEACTIVATE', null, 
            `Deactivated ${userIds.length} users`, req.ip);
          res.redirect('/admin/users?success=bulk_deactivated');
        }
      );
      break;
      
    case 'activate':
      db.run(
        `UPDATE users SET is_active = 1 WHERE id IN (${placeholders})`,
        userIds,
        (err) => {
          if (err) return res.status(500).send('Database error');
          logAdminAction(adminUser.id, 'BULK_ACTIVATE', null, 
            `Activated ${userIds.length} users`, req.ip);
          res.redirect('/admin/users?success=bulk_activated');
        }
      );
      break;
      
    case 'delete':
      // Don't allow deleting yourself
      const filteredIds = userIds.filter(id => id != adminUser.id);
      if (filteredIds.length === 0) {
        return res.status(400).send('Cannot delete your own account');
      }
      
      const deletePlaceholders = filteredIds.map(() => '?').join(',');
      db.serialize(() => {
        db.run(`DELETE FROM analytics WHERE user_id IN (${deletePlaceholders})`, filteredIds);
        db.run(`DELETE FROM links WHERE user_id IN (${deletePlaceholders})`, filteredIds);
        profileDB.run(`DELETE FROM profiles WHERE user_id IN (${deletePlaceholders})`, filteredIds);
        db.run(`DELETE FROM users WHERE id IN (${deletePlaceholders})`, filteredIds, (err) => {
          if (err) return res.status(500).send('Database error');
          logAdminAction(adminUser.id, 'BULK_DELETE', null, 
            `Deleted ${filteredIds.length} users`, req.ip);
          res.redirect('/admin/users?success=bulk_deleted');
        });
      });
      break;
      
    default:
      res.status(400).send('Invalid action');
  }
});

// === END ADMIN ROUTES ===

app.get('/manage', isAuthenticated, (req, res) => {
  const user = req.session.user;
  
  // Get user's links
  db.all("SELECT * FROM links WHERE user_id = ? ORDER BY position ASC", [user.id], (err, links) => {
    if (err) links = [];
    
    res.render('acc/manage', { 
      user, 
      username: user.username, 
      from: req.query.from,
      links: links || []
    });
  });
});

// Add new link
app.post('/manage/links/add', isAuthenticated, (req, res) => {
  const { title, url, description } = req.body;
  const userId = req.session.user.id;
  
  if (!title || !url) {
    return res.redirect('/manage?error=missing_fields');
  }
  
  // Get next position
  db.get("SELECT MAX(position) as maxPos FROM links WHERE user_id = ?", [userId], (err, result) => {
    const position = (result?.maxPos || 0) + 1;
    
    db.run(
      "INSERT INTO links (user_id, title, url, description, position) VALUES (?, ?, ?, ?, ?)",
      [userId, title, url, description, position],
      (err) => {
        if (err) return res.redirect('/manage?error=database');
        res.redirect('/manage?success=link_added');
      }
    );
  });
});

// Update link
app.post('/manage/links/:id/update', isAuthenticated, (req, res) => {
  const linkId = req.params.id;
  const { title, url, description, is_active } = req.body;
  const userId = req.session.user.id;
  
  db.run(
    "UPDATE links SET title = ?, url = ?, description = ?, is_active = ? WHERE id = ? AND user_id = ?",
    [title, url, description, is_active ? 1 : 0, linkId, userId],
    (err) => {
      if (err) return res.redirect('/manage?error=update_failed');
      res.redirect('/manage?success=link_updated');
    }
  );
});

// Delete link
app.post('/manage/links/:id/delete', isAuthenticated, (req, res) => {
  const linkId = req.params.id;
  const userId = req.session.user.id;
  
  db.run("DELETE FROM links WHERE id = ? AND user_id = ?", [linkId, userId], (err) => {
    if (err) return res.redirect('/manage?error=delete_failed');
    res.redirect('/manage?success=link_deleted');
  });
});

// Reorder links
app.post('/manage/links/reorder', isAuthenticated, (req, res) => {
  const { linkIds } = req.body; // Array of link IDs in new order
  const userId = req.session.user.id;
  
  if (!Array.isArray(linkIds)) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  
  linkIds.forEach((linkId, index) => {
    db.run(
      "UPDATE links SET position = ? WHERE id = ? AND user_id = ?",
      [index + 1, linkId, userId]
    );
  });
  
  res.json({ success: true });
});

app.get('/feed', isAuthenticated, (req, res) => {
  const user = req.session.user;
  const username = req.session.user ? req.session.user.username : null;
  const from = req.query.from;
  res.render('acc/feed', { user, username, from });
});

app.get('/settings', isAuthenticated, (req, res) => {
  const user = req.session.user;
  
  // Get user profile data
  profileDB.get("SELECT * FROM profiles WHERE user_id = ?", [user.id], (err, profile) => {
    res.render('acc/settings', { 
      user, 
      username: user.username, 
      from: req.query.from,
      profile: profile || {},
      success: req.query.success,
      error: req.query.error
    });
  });
});

// Update profile settings
app.post('/settings/profile', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { display_name, bio, location, website } = req.body;
  
  profileDB.run(
    `UPDATE profiles SET 
     display_name = ?, bio = ?, location = ?, website = ? 
     WHERE user_id = ?`,
    [display_name, bio, location, website, userId],
    (err) => {
      if (err) return res.redirect('/settings?error=profile_update_failed');
      res.redirect('/settings?success=profile_updated');
    }
  );
});

// Update account settings
app.post('/settings/account', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { email, current_password, new_password } = req.body;
  
  if (!current_password) {
    return res.redirect('/settings?error=current_password_required');
  }
  
  // Verify current password
  db.get("SELECT password FROM users WHERE id = ?", [userId], async (err, user) => {
    if (err || !user) {
      return res.redirect('/settings?error=user_not_found');
    }
    
    const isValidPassword = await bcrypt.compare(current_password, user.password);
    if (!isValidPassword) {
      return res.redirect('/settings?error=invalid_password');
    }
    
    let updateQuery = "UPDATE users SET email = ?";
    let params = [email];
    
    if (new_password) {
      const hashedNewPassword = await bcrypt.hash(new_password, 12);
      updateQuery += ", password = ?";
      params.push(hashedNewPassword);
    }
    
    updateQuery += " WHERE id = ?";
    params.push(userId);
    
    db.run(updateQuery, params, (err) => {
      if (err) return res.redirect('/settings?error=account_update_failed');
      
      // Update session email
      req.session.user.email = email;
      res.redirect('/settings?success=account_updated');
    });
  });
});

app.get('/customize', isAuthenticated, (req, res) => {
  const user = req.session.user;
  
  profileDB.get("SELECT * FROM profiles WHERE user_id = ?", [user.id], (err, profile) => {
    res.render('acc/customize', { 
      user, 
      username: user.username, 
      from: req.query.from,
      profile: profile || {},
      success: req.query.success,
      error: req.query.error
    });
  });
});

// Update theme and styling
app.post('/customize/theme', isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { theme, custom_css } = req.body;
  
  profileDB.run(
    "UPDATE profiles SET theme = ?, custom_css = ? WHERE user_id = ?",
    [theme, custom_css, userId],
    (err) => {
      if (err) return res.redirect('/customize?error=theme_update_failed');
      res.redirect('/customize?success=theme_updated');
    }
  );
});

app.get('/connections', isAuthenticated, (req, res) => {
  const user = req.session.user;
  const username = req.session.user ? req.session.user.username : null;
  const from = req.query.from;
  res.render('acc/connections', { user, username, from });
});

app.get('/custom-domain', isAuthenticated, (req, res) => {
  const user = req.session.user;
  const username = req.session.user ? req.session.user.username : null;
  const from = req.query.from;
  res.render('acc/custom-domain', { user, username, from });
});

app.get('/analytics', isAuthenticated, (req, res) => {
  const user = req.session.user;
  const timeframe = req.query.timeframe || '30days';
  
  let dateFilter = '';
  switch(timeframe) {
    case '7days':
      dateFilter = "AND a.clicked_at >= date('now', '-7 days')";
      break;
    case '30days':
      dateFilter = "AND a.clicked_at >= date('now', '-30 days')";
      break;
    case '90days':
      dateFilter = "AND a.clicked_at >= date('now', '-90 days')";
      break;
  }
  
  Promise.all([
    // Total clicks
    new Promise((resolve) => 
      db.get(`SELECT COUNT(*) as clicks FROM analytics a 
              JOIN links l ON a.link_id = l.id 
              WHERE l.user_id = ? ${dateFilter}`, [user.id], (err, row) => resolve(row?.clicks || 0))),
    
    // Profile views
    new Promise((resolve) => 
      profileDB.get("SELECT profile_views FROM profiles WHERE user_id = ?", [user.id], (err, row) => resolve(row?.profile_views || 0))),
    
    // Daily clicks
    new Promise((resolve) => 
      db.all(`SELECT DATE(a.clicked_at) as date, COUNT(*) as clicks 
              FROM analytics a 
              JOIN links l ON a.link_id = l.id 
              WHERE l.user_id = ? ${dateFilter}
              GROUP BY DATE(a.clicked_at) 
              ORDER BY date DESC`, [user.id], (err, rows) => resolve(rows || []))),
    
    // Top links
    new Promise((resolve) => 
      db.all(`SELECT l.title, l.url, COUNT(a.id) as clicks 
              FROM links l 
              LEFT JOIN analytics a ON l.id = a.link_id ${dateFilter.replace('AND', 'WHERE')}
              WHERE l.user_id = ? 
              GROUP BY l.id 
              ORDER BY clicks DESC LIMIT 10`, [user.id], (err, rows) => resolve(rows || []))),
    
    // Top countries
    new Promise((resolve) => 
      db.all(`SELECT a.country, COUNT(*) as clicks 
              FROM analytics a 
              JOIN links l ON a.link_id = l.id 
              WHERE l.user_id = ? ${dateFilter}
              GROUP BY a.country 
              ORDER BY clicks DESC LIMIT 10`, [user.id], (err, rows) => resolve(rows || [])))
  ]).then(([totalClicks, profileViews, dailyClicks, topLinks, topCountries]) => {
    res.render('acc/analytics', { 
      user,
      timeframe,
      analytics: {
        totalClicks,
        profileViews,
        dailyClicks,
        topLinks,
        topCountries
      }
    });
  }).catch(err => {
    console.error('Analytics error:', err);
    res.status(500).send('Error loading analytics');
  });
});