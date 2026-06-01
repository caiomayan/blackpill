require('dotenv').config();
const https = require('https');
const options = {
  hostname: 'open.faceit.com',
  path: '/data/v4/players?nickname=m0NESY',
  headers: {
    'Authorization': 'Bearer ' + process.env.FACEIT_API_KEY
  }
};

https.get(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const data = JSON.parse(body);
    const playerId = data.player_id;
    const statsOptions = {
      hostname: 'open.faceit.com',
      path: '/data/v4/players/' + playerId + '/stats/cs2',
      headers: {
        'Authorization': 'Bearer ' + process.env.FACEIT_API_KEY
      }
    };
    https.get(statsOptions, (sRes) => {
      let sBody = '';
      sRes.on('data', d => sBody += d);
      sRes.on('end', () => {
        const stats = JSON.parse(sBody);
        console.log(stats);
      });
    });
  });
});
