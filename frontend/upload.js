
const CLIENT_ID = "E1xbQwZTAZEfkZxmFOYYvQQnGmTHGqeg";
const CLIENT_SECRET = "bbr626Xv7hxJErlw";

// Faisal Masjid Coordinates
const latitude =43.0799;
const longitude = -79.0747;
const radius = 10; // km

// STEP 1 - Get Access Token
async function getAccessToken() {
    const url = "https://test.api.amadeus.com/v1/security/oauth2/token";

    const body =
        "grant_type=client_credentials" +
        `&client_id=${CLIENT_ID}` +
        `&client_secret=${CLIENT_SECRET}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    });

    const data = await response.json();
    console.log("TOKEN RESPONSE:", data);
    return data.access_token;
}

// STEP 2 - Fetch Activities Near Faisal Masjid
async function getActivities(token) {
    const url = `https://test.api.amadeus.com/v1/shopping/activities?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;

    const response = await fetch(url, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await response.json();
    console.log("ACTIVITIES RESPONSE:", data);
}

// MAIN FUNCTION
(async () => {
    try {
        const token = await getAccessToken();
        console.log("\nACCESS TOKEN:", token);

        console.log("\nFetching activities near Faisal Masjid...");
        await getActivities(token);
    } catch (err) {
        console.error("ERROR:", err);
    }
})();
