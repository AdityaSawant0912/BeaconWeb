// types/next-auth.d.ts (or add to an existing .d.ts file)

import 'next-auth';

// Extend the built-in Session type
declare module 'next-auth' {
    interface Session {
        // Add your custom properties here
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number; // Unix timestamp for when the access token expires
        error?: string; // Optional: for handling token refresh errors
        user: { // Ensure user properties are defined if you add custom ones
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

// Extend the built-in JWT type
declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        user?: { // Match the user structure from Session
            name?: string;
            email?: string;
            image?: string;
        };
        error?: string; // For refresh token rotation errors
    }
}