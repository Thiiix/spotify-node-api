let express = require('express');
let request = require('request');
let querystring = require('querystring');
let app = express();

const SERVICE_URI = 'http://localhost:8080';
const REDIRECT_URI = process.env.REDIRECT_URI || `${SERVICE_URI}/authorize`;
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

app.get('/token', (req, res) => {
  let code = req.query.code || null;
  let grant_type = req.query.grant_type || null;

  if (!code || !grant_type) {
    res.setHeader('Content-Type', 'application/json');
    res.badRequest(
      JSON.stringify({ error: 'invalid or missing params' })
    );
  }

  let token = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

  let bodyParams = {
    redirect_uri: REDIRECT_URI,
    grant_type: GRANT_TYPES[grant_type],
  }

  if (grant_type === 'authorization_code') {
    bodyParams['code'] = code;
  } else {
    bodyParams['refresh_token'] = code;
  }

  request.post({
    url: 'https://accounts.spotify.com/api/token',
    form: bodyParams,
    headers: { 'Authorization': `Basic ${token}` },
    json: true
  }, (error, response, body) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(body));
  });
});

let port = process.env.PORT || 8888

console.log(`Listening on port ${port}`)

app.listen(port)
