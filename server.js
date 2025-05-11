// server.js
const express = require('express');
const app = express();
app.use(express.static('.'));
app.listen(3000, () =>
  console.log('Serving on http://localhost:3000')
);
