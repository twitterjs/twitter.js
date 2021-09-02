<div align="center">
  <br />
  <p>
    <a href="#"><img src="https://i.imgur.com/nuAPgP5.png" width="546" alt="twitter.js" /></a>
  </p>
  <br />
  <p>
    <a href="https://discord.gg/f5Pefuskx4"><img src="https://img.shields.io/discord/791722432896434237?color=5865F2&label=discord&logo=discord&logoColor=white&style=flat-square" alt="twitter.js official discord server" /></a>
    <a href="https://www.npmjs.com/package/twitter.js"><img src="https://img.shields.io/npm/v/twitter.js?color=ff2511&style=flat-square" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/twitter.js"><img src="https://img.shields.io/npm/dt/twitter.js?color=1DB954&style=flat-square" alt="NPM downloads" /></a>
    <a href="https://developer.twitter.com/en/docs/twitter-api/early-access"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Ftwbadges.glitch.me%2Fbadges%2Fv2&style=flat-square" alt="Twitter API v2" /></a>
  </p>
</div>

# Twitter.js

An object-oriented Node.js and TypeScript library for interacting with Twitter API v2.

## Sample Code:

Using `twitter.js` fetching details about a twitter user is as easy as this:

```js
import { Client } from 'twitter.js';

const client = new Client();

client.on('ready', async () => {
  const user = await client.users.fetchByUsername({
    username: 'iShiibi',
  });
  console.log(user.description);  // Contributing to open-source 🌐
});

const token = 'your-bearer-token';

client.loginWithBearerToken(token)
```
