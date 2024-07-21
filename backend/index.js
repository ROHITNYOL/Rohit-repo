const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const { auth } = require("googleapis/build/src/apis/abusiveexperiencereport");
dotenv.config();
const calendar = google.calendar("v3");//defininng the version of the google calendar
const app = express();
app.use(express.json());//need this to work with the json data btw frontend and backend
const PORT = process.env.PORT || 5000;

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
//initialising a session basically to store some data in session
app.use(
  session({
    secret: process.env.SESSION_SECRET,//random secret anything for our session
    resave: false,//to not save previous data which is unneccessary for us
    saveUninitialized: false,//not saving that prev data
    cookie: { secure: true }, // Ensure secure cookie setting for production
  })
);

// Enable CORS
app.use(cors());

// Middleware to check OAuth2 tokens
const maintainsession = async (req, res, next) => {//eventhough this middle ware is not used in any function whenever these sessions work they automatically initialise this middleware
  const tokens = req.session.tokens;
  if (!tokens || !tokens.access_token || !tokens.refresh_token) {
    return res.status(401).json({ error: "OAuth2 tokens not set" });
  }

  if (tokens.expiry_date <= Date.now()) {//we send the refresh token whenever the session is expired
    try {
      const newAccessToken = await refreshTokens(tokens);
      tokens.access_token = newAccessToken;//replacing the access token with the new one
      req.session.tokens = tokens;//updating the new tokens
      oauth2Client.setCredentials(tokens);//reinitialising so session continues being logged in
      next();//continues the next function
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      res.status(401).json({ error: "Failed to refresh OAuth2 tokens" });
    }
  } else {
    oauth2Client.setCredentials(tokens);//or else continue with the old tokens only
    next();
  }
};

// Function to refresh OAuth2 tokens
async function refreshTokens(tokens) {
  const refreshToken = tokens.refresh_token;
  const { credentials } = await oauth2Client.refreshToken(refreshToken);
  const newAccessToken = credentials.access_token;
  const newExpiryDate = credentials.expiry_date;
  tokens.access_token = newAccessToken;
  tokens.expiry_date = newExpiryDate;
  return newAccessToken;
}


// Routes
app.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.redirect(authUrl);
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;//this code basically serves like a password to get the specific tokens
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    res.redirect(process.env.Front_endURL); // Replace with your frontend URL
  } catch (error) {
    console.error("Error handling OAuth2 redirect:", error);
    res.status(500).send("Error handling OAuth2 redirect");
  }
});
app.post("/createEvent", async (req, res) => {
  try {
    const { summary, description, start, end } = req.body;
    console.log(req.body)
    if (!summary || !description || !start || !end) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: start,//ensure these datetime is in isoString format
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: end,
        timeZone: "Asia/Kolkata",
      },
    };

    console.log("Creating event with body:", event);

    const response = await calendar.events.insert({
      auth: oauth2Client,//as the insertion or deletion needs authorisation
      calendarId: "primary",
      requestBody: event,
    });

    const createdEvent = response.data;
    console.log("Event created:", createdEvent);

    res.status(200).json({ message: "Event added successfully", event: createdEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});
//to fetch the events
app.get("/events", async (req, res) => {
  try {
    const { timeMin, timeMax } = req.query;//the encoded url that we sent from the frontend is basically the req now by using the express we get those data
    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: "primary",
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || undefined,
      maxResults: 10,//can show as many as required here set to max 10
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items;
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.delete("/events/:eventId", async (req, res) => {
  const eventId = req.params.eventId;

  try {
    await calendar.events.delete({
      auth:oauth2Client,
      calendarId: "primary",
      eventId: eventId,
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
