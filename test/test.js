import { Client } from '../src/index.js';

const token = {
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  bearerToken: process.env.BEARER_TOKEN,
};

const client = new Client();

client.on('ready', async () => {
  const me = await client.users.fetch('i_Shibi');
  const f = await me.fetchFollowing();
  console.log(f);
});

client.login(token);
