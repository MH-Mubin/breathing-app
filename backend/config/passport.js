import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Callback URL is relative if proxy handles it, but generally better to use full or let passport infer.
    // For local dev with proxy, we can use the full URL or relative.
    callbackURL: '/api/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // Check if email already exists
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
      
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          // Link google id to existing account
          user.googleId = profile.id;
          if (!user.profile.avatar && profile.photos && profile.photos.length > 0) {
            user.profile.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }
      }

      // Create new user
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: email || `${profile.id}@google-oauth.temp`,
        profile: {
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : ''
        }
      });

      return done(null, user);
    } catch (err) {
      console.error("Google Auth Error:", err);
      return done(err, null);
    }
  }
));

export default passport;
