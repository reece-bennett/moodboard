# Moodboard

A `.env` file must be present, containing details for a MongoDB instance and Google OAuth client:

```env
DB_URL=cluster-abc.mongodb.net/database
DB_USER=user
DB_PASSWORD=password
CLIENT_ID=abc123.apps.googleusercontent.com
```

The port can optionally be specified: `PORT=80`. If omitted port `8080` will be used.

If there are connection errors, check the IP whitelist on the DB instance.
