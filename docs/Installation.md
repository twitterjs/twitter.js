# Installation

This tutorial will help you setup a basic twitter bot project. You will create a new folder, install the `twitter.js` package, write some test code, and finally execute it locally to check whether it's working. So, let's get started, open a terminal on your machine and follow the steps given below.

**1. Create a new directory for your twitter bot project and move into it:**

```bash:no-line-numbers
mkdir twitter-bot
cd twitter-bot
```

Open the directory you created in an IDE or text-editor of your choice.

**2. Initialize your project:**

```bash:no-line-numbers
npm init -y
```

This will create a new `package.json` file in the current directory.

**3. Install twitter.js package from npm:**

```bash:no-line-numbers
npm install twitter.js
```

**4. Open the `package.json` file and add the following highlighted lines to it:**

```json{7,15}
{
  "name": "twitter-bot",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "twitter.js": "^0.13.0"
  },
  "type": "module"
}
```

**5. Create a new `index.js` file and write the following basic code in it:**

```js
const { Client } = require('twitter.js');

const client = new Client();

console.log(client.readyAt); // null
```

**6. Execute the code you have written in `index.js` file:**

```bash:no-line-numbers
npm start
```

If you get `null` printed in the terminal then congratulations, you successfully completed the initial setup for your twitter bot project.

Currently, your code isn't really doing anything. You will need to generate some credentials from twitter developer portal to continue further and actually create a working twitter bot.
