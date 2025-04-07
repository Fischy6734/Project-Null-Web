const express = require('express');
const request = require('request');
const session = require('express-session');
const app = express();

const clientID = 'Ov23liuZzCImoXNqqVU1';
const clientSecret = '5c3ca50dc7a55afdea42666a5ae5746a5be2cf71';

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

app.get('/callback', (req, res) => {
  const code = req.query.code;

  const options = {
    url: 'https://github.com/login/oauth/access_token',
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    },
    json: {
      client_id: clientID,
      client_secret: clientSecret,
      code: code
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      return res.send('Error: ' + error.message);
    }

    const accessToken = body.access_token;
    req.session.accessToken = accessToken;

    res.redirect('/');
  });
});

app.get('/profile', (req, res) => {
  const accessToken = req.session.accessToken;

  if (!accessToken) {
    return res.status(401).send('Not authenticated');
  }

  const userOptions = {
    url: 'https://api.github.com/user',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'User-Agent': 'Your App Name'
    }
  };

  request(userOptions, (userError, userResponse, userBody) => {
    if (userError) {
      return res.send('Error: ' + userError.message);
    }

    res.json(JSON.parse(userBody));
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});