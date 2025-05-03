const express = require('express');
const app = express();
const path = require('path');

// EJS als Template-Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Einzige Route
app.get('/', (req, res) => {
  res.render('index', { name: 'Velink', links: [
    { title: "GitHub", url: "https://github.com" },
    { title: "Website", url: "https://velis.me" }
  ]});
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});
