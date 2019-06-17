let express = require('express');
let request = require('request');
let querystring = require('querystring');
let app = express();

const SERVICE_URI = 'http://localhost:8888';
const REDIRECT_URI = process.env.REDIRECT_URI || `${SERVICE_URI}/callback`;
const GRANT_TYPES = {
    'authorization_code': 'authorization_code',
    'refresh_token': 'refresh_token'
  };

app.get('/login', (req, res) => {
  let scopes = [
    'user-read-private',
    'user-read-email'
  ];

  if (req.query.scopes) {
    splited_scopes = req.query.scopes.split(/\b\s+/);
    splited_scopes.map(scope => {
      scopes.push(scope);
    });
  }

  let params = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes.join(' '),
    redirect_uri: REDIRECT_URI
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
})

app.get('/callback', (req, res) => {
  let code = req.query.code || null;
  let token = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

  request.post({
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: GRANT_TYPES['authorization_code']
    },
    headers: { 'Authorization': `Basic ${token}` },
    json: true
  }, (error, response, body) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  });
});

app.get('/refresh_token', (req, res) => {
  let refresh_token = req.query.refresh_token || null;
  let token = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

  request.post({
    url: 'https://accounts.spotify.com/api/token',
    form: {
      refresh_token: refresh_token,
      redirect_uri: REDIRECT_URI,
      grant_type: GRANT_TYPES['refresh_token']
    },
    headers: { 'Authorization': `Basic ${token}` },
    json: true
  }, (error, response, body) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  });
})

let port = process.env.PORT || 8888

console.log(`Listening on port ${port}`)

app.listen(port)
