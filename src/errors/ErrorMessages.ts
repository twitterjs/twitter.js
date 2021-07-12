import { regsiterErrorMessage } from './TwitterjsError.js';

const messages = {
  INVALID_TYPE: (name: string, expected: string, an = false) =>
    `Supplied ${name} is not a${an ? 'n' : ''} ${expected}.`,
  TWEET_RESOLVE_ID: (action: string) => `Could not resolve the tweet ID to ${action}.`,
  INVALID_FETCH_OPTIONS: 'Could not fetch the requested data due to supplied options being invalid or incomplete.',
  USER_RESOLVE_ID: (action: string) => `Could not resolve the user ID to ${action}.`,
  NOT_BEARER_CLIENT: 'The client used to log in with is not an instance of BearerClient',
  NOT_USER_CONTEXT_CLIENT: 'The client used to log in with is not an instance of UserContextClient',
  NO_BEARER_TOKEN: 'Unable to find bearer token for making API requests',
  NO_CLIENT_CREDENTIALS: 'Unable to find client credentials for making API requests',
  NO_LOGGED_IN_USER: 'Could not find the logged in user to make the authorized request on behalf of',
  PAGINATED_RESPONSE_TAIL_REACHED: (type: string) =>
    `Cannot fetch the next page due to hitting the end of the ${type}.`,
  PAGINATED_RESPONSE_HEAD_REACHED: (type: string) =>
    `Cannot fetch the previous page due to hitting the start of the ${type}.`,
};

for (const [key, message] of Object.entries(messages)) {
  regsiterErrorMessage(key, message);
}
