// Benötigte Module importieren
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();

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
  console.log('Keine Zertifikate gefunden, starte HTTP-Server auf Port 80...');
  http.createServer(app).listen(80, '0.0.0.0', () => {
    console.log('HTTP-Server läuft auf Port 80');
  });
}

const whitelist = [
];

function ipWhitelist(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

  if (whitelist.includes(ip)) {
    next(); 
  } else {
    res.status(403).render('no_access', { ip });
  }
}

// Nutzerdatenbank initialisieren
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) console.error('DB-Fehler:', err.message);
  else console.log('📦 SQLite3-Nutzerdatenbank verbunden');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`);

// Profildatenbank initialisieren
const profileDB = new sqlite3.Database('./profiles.db', (err) => {
  if (err) console.error('Profil-DB-Fehler:', err.message);
  else console.log('📦 SQLite3-Profil-Datenbank verbunden');
});

profileDB.run(`CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY,
  bio TEXT,
  avatar TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Konfiguration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'ultrageheimes_sitzungsgeheimnis_!123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // auf true setzen bei HTTPS
    maxAge: 1000 * 60 * 60 * 2 // 2 Stunden
  }
}));

// Middleware zur Prüfung, ob der Nutzer eingeloggt ist
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// Startseite
app.get('/', (req, res) => {
  const username = req.session.user ? req.session.user.username : null;
  const from = req.query.from;
  res.render('start', { user: req.session.user, username, from });
});

// Registrierung
app.get('/register',ipWhitelist, (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', ipWhitelist,  async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.render('register', { error: 'Alle Felder ausfüllen.' });

  try {
    const hashed = await bcrypt.hash(password, 12);
    db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed],
      function (err) {
        if (err) return res.render('register', { error: 'Benutzername oder E-Mail bereits vergeben.' });

        const userId = this.lastID;
        // Profil automatisch anlegen
        profileDB.run("INSERT INTO profiles (user_id, bio, avatar) VALUES (?, ?, ?)",
          [userId, '', 'default.png'], (err) => {
            if (err) console.error('Profil konnte nicht angelegt werden:', err.message);
          });

        req.session.user = { id: userId, username, email };
        res.redirect(`/?from=register`);
      }
    );
  } catch (e) {
    res.render('register', { error: 'Interner Fehler. Bitte später versuchen.' });
  }
});

// Login
app.get('/login', ipWhitelist,  (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', ipWhitelist, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.render('login', { error: 'Alle Felder ausfüllen.' });

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) return res.render('login', { error: 'Ungültige Anmeldedaten.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.render('login', { error: 'Ungültige Anmeldedaten.' });

    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.redirect(`/?from=login`);
  });
});

// Benutzerseite mit Profildaten
app.get('/profile/:username', (req, res) => {
  const isOwnProfile = req.session.user && req.session.user.username === req.params.username;

  db.get("SELECT * FROM users WHERE username = ?", [req.params.username], (err, user) => {
    if (err || !user) return res.status(404).send("Benutzer nicht gefunden");

    profileDB.get("SELECT * FROM profiles WHERE user_id = ?", [user.id], (err, profile) => {
      if (err) return res.status(500).send("Fehler beim Laden des Profils");
      res.render('profile', {
        username: user.username,
        email: user.email,
        isOwnProfile,
        profile: profile || { bio: '', avatar: 'default.png' },
        user: req.session.user
      });
    });
  });
});

// Logout
app.get('/logout', ipWhitelist, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});