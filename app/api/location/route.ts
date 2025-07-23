// /api/location/route.ts

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users'; // Assuming User model is available
import Location from '@/models/Location'; // Assuming Location model is defined from LocationSchema
import SharePermission from '@/models/SharePermission';

/**
 * @route POST /api/location
 * @description Creates a new location record for the authenticated user.
 * @param request - The NextRequest object containing the location data in the body.
 * @returns NextResponse with success message and the created location, or an error.
 */
export async function POST(request: NextRequest) {
    try {
        // Parse the JSON body from the request. Expects { coordinates: [longitude, latitude] }
        const body = await request.json();
        const session = await auth(); // Get the user session

        // Check if the user is authenticated
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        try {
            await dbconnect(); // Connect to the MongoDB database

            // Find the user by email to get their _id
            const user = await User.findOne({ email: session.user.email });
            if (!user) {
                return NextResponse.json({ message: 'User not found', error: "User associated with session email does not exist" }, { status: 404 });
            }

            // Create a new Location document
            // The timestamp field will automatically be set by Mongoose's default value
            const location = await Location.create({
                userId: user._id, // Link location to the user's ObjectId
                coordinates: body.coordinates, // Expects {lat, lng}
            });

            return NextResponse.json({ message: "Location recorded successfully", location });
        } catch (error) {
            console.error("Database Error in POST /api/location:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }

    } catch (error) {
        console.error("Internal Server Error in POST /api/location:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route GET /api/location
 * @description Retrieves location records for the authenticated user and
 * locations of users who have shared with the current user.
 * @param request - The NextRequest object.
 * @returns NextResponse with an array of location records, or an empty array.
 */
export async function GET() {
    try {
        const session = await auth(); // Get the user session

        // Check if the user is authenticated
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        try {
            await dbconnect(); // Connect to the MongoDB database

            // Find the current user by email to get their _id
            const currentUser = await User.findOne({ email: session.user.email });
            if (!currentUser) {
                return NextResponse.json({ message: 'User not found', error: "User associated with session email does not exist" }, { status: 404 });
            }

            const currentUserId = currentUser._id;

            // 1. Get the current user's own locations
            const myLocations = await Location.find({ userId: currentUserId })
                .sort({ timestamp: -1 }); // Sort by timestamp descending

            // 2. Find users who have shared their location with the current user
            const sharedPermissions = await SharePermission.find({
                viewerId: currentUserId,
                status: 'active' // Only consider active sharing permissions
            }).select('sharerId'); // Select only the sharerId

            // Extract the IDs of the users who are sharing their location with the current user
            const sharerIds = sharedPermissions.map(permission => permission.sharerId);

            let sharedLocations: unknown[] = [];
            if (sharerIds.length > 0) {
                // For each sharer, find their latest location
                // Using $in to query for multiple user IDs
                // Note: This approach fetches ALL locations for these users and then sorts.
                // For very high volume, you might consider aggregation or a more optimized query
                // to get only the *latest* for each, but for now, this is simpler.
                sharedLocations = await Location.find({ userId: { $in: sharerIds } })
                    .sort({ timestamp: -1 }); // Sort by timestamp descending

                // If you only want the *absolute latest* for each sharer, you'd need an aggregation pipeline:
                // sharedLocations = await Location.aggregate([
                //     { $match: { userId: { $in: sharerIds } } },
                //     { $sort: { timestamp: -1 } },
                //     { $group: { _id: "$userId", latestLocation: { $first: "$$ROOT" } } },
                //     { $replaceRoot: { newRoot: "$latestLocation" } }
                // ]);
            }

            // Combine the current user's locations and the shared locations
            const allLocations = { myLocations, sharedLocations };

            return NextResponse.json({ locations: allLocations });

        } catch (error) {
            console.error("Database Error in GET /api/location:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }
    } catch (error) {
        console.error("Internal Server Error in GET /api/location:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route DELETE /api/location
 * @description Deletes a specific location record by its ID for the authenticated user.
 * @param request - The NextRequest object containing the ID in search parameters.
 * @returns NextResponse with a success message or an error.
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Get the location document ID from query parameters

    // Check if an ID was provided
    if (!id) {
        return NextResponse.json({ message: 'Bad Request', error: "Location ID is required" }, { status: 400 });
    }

    try {
        const session = await auth(); // Get the user session

        // Check if the user is authenticated
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        try {
            await dbconnect(); // Connect to the MongoDB database

            // Find the user by email to get their _id
            const user = await User.findOne({ email: session.user.email });
            if (!user) {
                return NextResponse.json({ message: 'User not found', error: "User associated with session email does not exist" }, { status: 404 });
            }

            // Delete the location document, ensuring it belongs to the authenticated user
            const result = await Location.deleteOne({ _id: id, userId: user._id });

            if (result.deletedCount === 0) {
                return NextResponse.json({ message: "Location not found or not authorized to delete" }, { status: 404 });
            }

            return NextResponse.json({ message: "Location deleted successfully" });

        } catch (error) {
            console.error("Database Error in DELETE /api/location:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }
    } catch (error) {
        console.error("Internal Server Error in DELETE /api/location:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}