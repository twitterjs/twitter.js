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
  const u = await client.users.fetch({ user: ['i_Shibi', 'TwitterDev'] });
  console.log(u);
});

client.login(token);
