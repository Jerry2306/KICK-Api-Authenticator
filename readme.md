# 1. Load dependencies
Run following command in the root folder to retrieve dependencies.
```
npm install
```

# 2. Create .env file
Create a file named ```.env``` in the root folder and add the following content. Replace the ClientId and ClientSecret with the values of your created KICK App.

```
APP_PORT=6969
KICKAPI_CLIENTID=<YOUR_KICK_APP_CLIENTID>
KICKAPI_CLIENTSECRET=<YOUR_KICK_APP_CLIENTSECRET>
```

# 3. Run the server
Run following command in the root folder to start the server.
```
node server.js
```

# 4. Open the website
Go to ```http://localhost:6969/app``` in your browser.

# 5. Authorize with your KICK Account
Click the ```Login``` button and you will be redirected to ```https://id.kick.com```. There you have to authorize your application for your account. Afterward you will be redirected to ```http://localhost:6969/app/token.html``` where your AccessToken and RefreshToken will be shown.