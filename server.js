// Benötigte Module importieren
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

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
  res.render('start', { user: req.session.user });
});

// Registrierung
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
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
        res.redirect(`/profile/${username}`);
      }
    );
  } catch (e) {
    res.render('register', { error: 'Interner Fehler. Bitte später versuchen.' });
  }
});

// Login
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.render('login', { error: 'Alle Felder ausfüllen.' });

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) return res.render('login', { error: 'Ungültige Anmeldedaten.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.render('login', { error: 'Ungültige Anmeldedaten.' });

    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.redirect(`/profile/${user.username}`);
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
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});
