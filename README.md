# Google Calendar Integration

## Environment Variables Required

### Backend
In your backend server, which interacts with the Google Calendar API, you'll need the following environment variables:

- **CLIENT_ID**: Obtained from the Google Developer Console project for OAuth 2.0 authentication.
- **CLIENT_SECRET**: Also obtained from the Google Developer Console project for OAuth 2.0 authentication.
- **REDIRECT_URL**: The URL where Google should redirect after authentication. This should be set to `backend_url/auth/callback`.
- **SESSION_SECRET**: A secret string used to sign the session ID cookie in Express.js for session management.
- **Front_endURL**: The URL of your frontend application. This is where users will be redirected after successful authentication with Google.

### Frontend
For your frontend application, configure the backend URL to communicate with the backend server securely:

- **VITE_Backend_URL**: The URL of your backend server. This allows the frontend to make API requests to the backend for Google Calendar operations.

## Setting Up Google Calendar Integration

1. **Google Developer Console Setup**:
   - Create a new project (if not already created) in the [Google Developer Console](https://console.developers.google.com/).
   - Enable the Google Calendar API for your project.
   - Create OAuth 2.0 credentials (Client ID and Client Secret) for web applications.

2. **Backend Implementation**:
   - Configure your backend server (using Express.js, for example) to handle OAuth 2.0 authentication with Google using the `google-auth-library`.
   - Implement endpoints to handle authentication (`/auth` and `/auth/callback`) and Google Calendar operations (`/createEvent`, `/events`, `/deleteEvent`).

3. **Frontend Implementation**:
   - Use the `VITE_Backend_URL` environment variable to set the backend URL in your frontend application.
   - Implement UI components and logic to trigger Google Calendar operations via API requests to the backend.
