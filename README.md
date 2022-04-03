<div align="center">
  <p>
    <a href="https://github.com/twitterjs/twitter.js"><img src="https://raw.githubusercontent.com/twitterjs/guide/main/src/.vuepress/public/branding/banner_small.png" title="Twitter.js" alt="twitter.js github" /></a>
  </p>
  <p>
    <a href="https://discord.gg/f5Pefuskx4"><img src="https://img.shields.io/discord/791722432896434237?color=5865F2&label=discord&logo=discord&logoColor=white&style=flat-square" alt="twitter.js official discord server" /></a>
    <a href="https://www.npmjs.com/package/twitter.js"><img src="https://img.shields.io/npm/v/twitter.js?color=ff2511&style=flat-square" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/twitter.js"><img src="https://img.shields.io/npm/dt/twitter.js?color=1DB954&style=flat-square" alt="NPM downloads" /></a>
    <a href="https://developer.twitter.com/en/docs/twitter-api/early-access"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Ftwbadges.glitch.me%2Fbadges%2Fv2&style=flat-square" alt="Twitter API v2" /></a>
  </p>
</div>

# Twitter.js

A Node.js and TypeScript library for interacting with Twitter API v2

## Installation

```bash
npm i twitter.js
```

## Usage

🚀 Fetch details about a twitter user in no time:

```js
import { Client } from 'twitter.js';
import { bearerToken } from './secrets.js';

const client = new Client();
await client.loginWithBearerToken(bearerToken);

const user = await client.users.fetchByUsername('iShiibi');
console.log(user.description); // Contributing to open-source 🌐
```

🔒 Make [`user-context`](https://developer.twitter.com/en/docs/authentication/oauth-1-0a) authorized requests without any hassle:

```js
import { Client } from 'twitter.js';
import { credentials } from './secrets.js';

const client = new Client();
await client.login(credentials);

const tweet = await client.tweets.fetch('1336749579228745728');
await tweet.like();
```

📈 Want real-time events listening? We got you covered:

```js
import { Client } from 'twitter.js';
import { credentials } from './secrets.js';

const client = new Client({ events: ['FILTERED_TWEET_CREATE'] });
await client.login(credentials);

await client.filteredStreamRules.create({ value: '@tjs_test' });

client.on('filteredTweetCreate', async tweet => {
	console.log(tweet.text); // hey @tjs_test, like this tweet if you're listening!
	await tweet.like();
});
```

## Future

The `twitter.js` library is not ready for production use yet. You can expect breaking changes without any major version bump until we release `v1.0.0` of the library.
