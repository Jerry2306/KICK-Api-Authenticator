require('dotenv').config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const redirectUri = `http://localhost:${process.env.APP_PORT}/app/token.html`;

function randomStringAsBase64Url(size) {
    return crypto.randomBytes(size).toString("base64url");
}

function createBase64Sha256FromString(input) {
    return crypto.createHash("sha256").update(input).digest("base64url");
}

function combineUrlSegments(baseUrl, ...segments) {
    const url = new URL(baseUrl);
    segments.forEach(segment => {
        url.pathname = `${url.pathname.replace(/\/$/, '')}/${segment.replace(/^\/?/, '')}`;
    });
    return url.toString();
}

const clientStateCollection = {};

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/api/auth/url", (req, res) => {
    let clientState = randomStringAsBase64Url(32);
    let clientChallenge = randomStringAsBase64Url(64);

    clientStateCollection[clientState] = clientChallenge;

    const url = new URL("https://id.kick.com/oauth/authorize");

    url.searchParams.set("client_id", process.env.KICKAPI_CLIENTID);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", clientState);
    url.searchParams.set("scope", "user:read channel:read channel:write chat:write events:subscribe");
    url.searchParams.set("code_challenge", createBase64Sha256FromString(clientChallenge));
    url.searchParams.set("code_challenge_method", "S256");

    res.json({ kickIdUrl: url.toString() });
});

app.get("/api/auth/token", async (req, res) => {
    const clientState = req.query.state;
    console.log(`Client-State: ${clientState}`);
    const code = req.query.code;
    console.log(`Client-Code: ${code}`);

    const clientChallenge = clientStateCollection[clientState];
    console.log(`Client-Challenge: ${clientChallenge}`);
    if (clientChallenge == null) {
        res.status(403).send("Invalid state!");
        return;
    }

    const data = new URLSearchParams({
        code: code,
        client_id: process.env.KICKAPI_CLIENTID,
        client_secret: process.env.KICKAPI_CLIENTSECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: clientChallenge
    });

    console.log(`Data: ${data.toString()}`);

    const tokenResponse = await fetch("https://id.kick.com/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data.toString()
    });

    if (!tokenResponse.ok) {
        console.log("Error from kick token api!");
        console.log(tokenResponse);
        res.status(403).send("Invalid response from kick!");
        return;
    }

    delete clientStateCollection[clientState];

    res.setHeader("Content-Type", "application/json");
    res.send(await tokenResponse.json());
});

app.post("/webhook/kick/v1", (req, res) => {
    const accessToken = req.query.accessToken;

    /*if (accessToken !== process.env.WEBHOOK_ACCESSTOKEN) {
        console.log("Webhook endpoint called without or invalid access token!");
        res.status(200).send();
        return;
    }*/

    console.log("");
    console.log("-------------Webhook POST from Kick------------------");
    console.log("HEADERS:");
    console.log(req.headers);
    console.log("BODY:");
    console.log(req.body);
    console.log("------------------Webhook END------------------------");
    console.log("");

    res.status(200).send();
});

app.listen(process.env.APP_PORT, () => {
    console.log(`Server läuft auf http://localhost:${process.env.APP_PORT}`);
});


