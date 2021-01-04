import { Client } from '../src/index.js';

const token = process.env.TWITTER_TOKEN;

const client = new Client();

client.on('ready', async () => {
  const u = await client.users.fetch({ user: ['i_Shibi', 'TwitterDev'] });
  console.log(u);
});

client.login(token);
