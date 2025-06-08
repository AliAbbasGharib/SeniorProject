const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(__dirname, 'token.json');  
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this URL:\n", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question("Enter the code from that page here: ", resolve);
  });

  rl.close();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("Token stored to", TOKEN_PATH);
  return oAuth2Client;
}

async function sendMail({ to, subject, html }) {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const rawMessage = Buffer.from([
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    html,
  ].join("\n")).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
    },
  });
}

module.exports = { sendMail };
