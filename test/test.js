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
  const tweet = await client.tweets.fetch('1351284149588398081');
  console.log(tweet);
  tweet.unhideReply('1351284615734956032').then(b => console.log(b));
});

client.login(token);
