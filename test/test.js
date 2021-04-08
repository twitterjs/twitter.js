import { Client } from '../src/index.js';

const token = {
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  bearerToken: process.env.BEARER_TOKEN,
  username: 'iShiibi',
};

const client = new Client();

client.on('ready', async () => {
  const user = await client.users.fetch('First_Comrade');
  user.unfollow().then(console.log);
});

client.login(token);
