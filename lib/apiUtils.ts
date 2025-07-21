// lib/apiUtils.ts
import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users'; // Assuming User model is available

/**
 * Standardized API error response.
 * This function creates a consistent error response for API routes.
 * It logs the error internally and returns a NextResponse with a JSON payload.
 *
 * @param message - A user-friendly message describing the error.
 * @param error - The actual error object or string for internal logging.
 * @param status - The HTTP status code to be returned (e.g., 400, 403, 404, 500).
 * @returns NextResponse with a JSON error payload.
 */
export function handleApiError(message: string, error: any, status: number): NextResponse {
    console.error(`API Error (${status}): ${message}`, error);
    // Return a consistent error structure. Use error.message if available, otherwise convert to string.
    return NextResponse.json({ message, error: error?.message || error?.toString() || 'Unknown error' }, { status });
}

/**
 * Authenticates the request and connects to the database.
 * This helper function encapsulates common boilerplate for API routes:
 * 1. Authenticates the user session.
 * 2. Connects to the MongoDB database.
 * 3. Finds the authenticated user's document in the database.
 * If any step fails, it throws a NextResponse error, which can be caught by the route handler.
 *
 * @param request - The NextRequest object.
 * @returns A promise that resolves to an object containing the authenticated session and user document.
 * @throws {NextResponse} If authentication fails, user is not found, or database connection fails.
 */
export async function authenticateAndConnect(request: NextRequest): Promise<{ session: any, user: any }> {
    const session = await auth();
    // If no session or user email in session, return Unauthorized error
    if (!session || !session.user?.email) {
        throw handleApiError('Unauthorized', 'Forbidden', 403);
    }

    // Connect to the database
    await dbconnect();

    // Find the user in the database using their email from the session
    const user = await User.findOne({ email: session.user.email });
    // If user not found in DB, return Not Found error
    if (!user) {
        throw handleApiError('User not found', 'User associated with session email does not exist in database', 404);
    }

    // Return the session and user object for use in the route handler
    return { session, user };
}

