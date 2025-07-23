// app/api/location/route.ts (or pages/api/location.ts)

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users';
import Location from '@/models/Location';
import mongoose from 'mongoose';
// import SharePermission from '@/models/SharePermission'; // Keep for future use in GET if needed, but primary logic moves to sharepermission route

/**
 * @route POST /api/location
 * @description Creates a new location record for the authenticated user.
 * This is primarily for recording location updates from the mobile app.
 * @param request - The NextRequest object containing the location data in the body.
 * Expected body: { coordinate: { lat: number, lng: number } }
 * @returns NextResponse with success message and the created location, or an error.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { coordinate } = body; // Expects { coordinate: {lat, lng} }
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        if (!coordinate || typeof coordinate.lat !== 'number' || typeof coordinate.lng !== 'number') {
            return NextResponse.json({ message: 'Bad Request', error: "Valid 'coordinate' (lat, lng) is required" }, { status: 400 });
        }

        await dbconnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found', error: "User associated with session email does not exist" }, { status: 404 });
        }

        // Create a new Location document
        const location = await Location.create({
            userId: user._id,
            coordinate: { lat: coordinate.lat, lng: coordinate.lng }, // Match schema
        });

        return NextResponse.json({ message: "Location recorded successfully", location });

    } catch (error) {
        console.error("Error in POST /api/location:", error);
        const errorName = (error instanceof Error) ? error.name : 'Unknown error';
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        if (errorName === 'ValidationError') {
            return NextResponse.json({ message: 'Validation Error', error: errorMessage }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route GET /api/location
 * @description Retrieves latest location records for the authenticated user.
 * If user IDs are provided as query params, it also attempts to retrieve their latest locations.
 * This route is now primarily for fetching historical or specific user locations,
 * not the main Beacon Hub data (which is handled by /api/sharepermission GET).
 * @param request - The NextRequest object. Query param: userIds (comma-separated string)
 * @returns NextResponse with an array of latest location records.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        await dbconnect();
        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) {
            return NextResponse.json({ message: 'User not found', error: "User associated with session email does not exist" }, { status: 404 });
        }

        const currentUserId = currentUser._id;
        const { searchParams } = new URL(request.url);
        const userIdsParam = searchParams.get('userIds'); // e.g., ?userIds=id1,id2,id3

        const targetUserIds: mongoose.Types.ObjectId[] = [currentUserId]; // Always include current user's location

        if (userIdsParam) {
            const externalUserIds = userIdsParam.split(',')
                .filter(id => mongoose.Types.ObjectId.isValid(id))
                .map(id => new mongoose.Types.ObjectId(id));
            targetUserIds.push(...externalUserIds);
        }

        // Use aggregation to get the latest location for each target user ID
        const latestLocations = await Location.aggregate([
            {
                $match: {
                    userId: { $in: targetUserIds }
                }
            },
            {
                $sort: { timestamp: -1 } // Sort by latest timestamp first
            },
            {
                $group: {
                    _id: "$userId", // Group by userId
                    latestLocation: { $first: "$$ROOT" } // Take the first (latest) document in each group
                }
            },
            {
                $replaceRoot: { newRoot: "$latestLocation" } // Promote the latestLocation document to the root
            }
        ]);

        return NextResponse.json({ latestLocations });

    } catch (error) {
        console.error("Error in GET /api/location:", error);
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
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Bad Request', error: "Valid Location ID is required" }, { status: 400 });
    }

    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        await dbconnect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: 'User not found', error: "User associated with session email does not exist" }, { status: 404 });
        }

        const result = await Location.deleteOne({ _id: id, userId: user._id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Location not found or not authorized to delete" }, { status: 404 });
        }

        return NextResponse.json({ message: "Location deleted successfully" });

    } catch (error) {
        console.error("Error in DELETE /api/location:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}