const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const cors = require("cors");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);


app.use(
    cors({
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );

app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar']
  });
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Authentication successful! Please return to the console.');
});
app.post('/events', async (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const event = {
      summary: 'Google I/O 2021',
      description: 'A chance to hear more about Google\'s developer products.',
      start: {
        dateTime: '2021-05-28T09:00:00-07:00',
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: '2021-05-28T17:00:00-07:00',
        timeZone: 'America/Los_Angeles',
      },
    };
  
    try {
      const response = await calendar.events.insert({
        auth:oauth2Client,
        calendarId: 'primary',
        requestBody: event,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/events', async (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      res.status(200).json(response.data.items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/events/:eventId', async (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const eventId = req.params.eventId;
  
    const event = {
      summary: 'Updated Event Title',
      location: 'Updated Event Location',
      description: 'Updated Event Description',
      start: {
        dateTime: '2021-05-29T09:00:00-07:00',
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: '2021-05-29T17:00:00-07:00',
        timeZone: 'America/Los_Angeles',
      },
    };
  
    try {
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/events/:eventId', async (req, res) => {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const eventId = req.params.eventId;
  
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
