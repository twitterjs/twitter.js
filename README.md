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

# twitter.js (WIP)

An object-oriented TypeScript library for interacting with Twitter API v2.

## Sample Code:

Here is a sample code to get a user from twitter using their username:

```js
import { BearerClient } from 'twitter.js';

const client = new BearerClient();

client.on('ready', async () => {
  const user = await client.users.fetchByUsername({
    username: 'iShiibi',
  });
  console.log(user);
});

const token = 'your-bearer-token';

client.login(token);
```

You can do a lot more than that using twitter.js library. The lib and documentation for it is still in devlopment. Contributions are welcome and so are the stars 🌟
