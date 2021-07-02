import { regsiterErrorMessage } from './TwitterjsError.js';

const messages = {
  INVALID_TYPE: (name: string, expected: string, an = false) =>
    `Supplied ${name} is not a${an ? 'n' : ''} ${expected}.`,
  TWEET_RESOLVE_ID: 'Could not resolve the tweet ID to fetch the tweet.',
  FETCH_TWEETS_TYPE: 'The tweets property of options must be an Array',
  INVALID_FETCH_OPTIONS: 'Could not fetch the requested data due to supplied options being invalid or incomplete',
};

for (const [key, message] of Object.entries(messages)) {
  regsiterErrorMessage(key, message);
}
