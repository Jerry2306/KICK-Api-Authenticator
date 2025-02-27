async function doKickIdAuth() {
    const response = await fetch(`${window.location.origin}/api/auth/url`);

    if (!response.ok) {
        setErrorMessage(await response.text());
        return;
    }

    var responseObj = await response.json();

    window.location.href = responseObj.kickIdUrl;
}

async function doTokenAuth() {
    const queryParams = new URLSearchParams(window.location.search);

    const clientCode = queryParams.get('code');
    const clientState = queryParams.get('state');

    if (clientCode == null || clientState == null) {
        setErrorMessage("Invalid callback query parameters. Expected are 'code' and 'state'!");
        return;
    }

    const response = await fetch(`${window.location.origin}/api/auth/token?${queryParams.toString()}`);

    if (!response.ok) {
        setErrorMessage(await response.text());
        return;
    }

    var tokenInfosSpan = document.getElementById("token-infos");
    if (tokenInfosSpan == null) {
        setErrorMessage("Element 'token-infos' was not found!");
        return;
    }

    tokenInfosSpan.innerHTML = await response.text();
}

function setErrorMessage(errorMessage) {
    var errorMessageSpan = document.getElementById("error-message");
    if (errorMessageSpan == null) return;
    errorMessageSpan.innerHTML = errorMessage;
}