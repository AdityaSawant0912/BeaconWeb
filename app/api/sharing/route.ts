// app/api/sharing/route.ts (or pages/api/sharing.ts)

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users';
import SharePermission from '@/models/SharePermission';

/**
 * @route POST /api/sharing
 * @description Sends a location request from the authenticated user (viewer) to another user (sharer).
 * Creates a SharePermission document with status 'pending_request'.
 * @param request - The NextRequest object containing the sharer's email in the body.
 * Expected body: { sharerEmail: string }
 * @returns NextResponse with success message and the created permission.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sharerEmail } = body; // The email of the user whose location is being requested
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        if (!sharerEmail || typeof sharerEmail !== 'string') {
            return NextResponse.json({ message: 'Bad Request', error: "Sharer email is required" }, { status: 400 });
        }

        await dbconnect();

        // Find the current authenticated user (viewer in this request)
        const viewerUser = await User.findOne({ email: session.user.email });
        if (!viewerUser) {
            return NextResponse.json({ message: 'Viewer user not found', error: "User associated with session email does not exist" }, { status: 404 });
        }

        // Find the target user (sharer) by their email
        const sharerUser = await User.findOne({ email: sharerEmail });
        if (!sharerUser) {
            return NextResponse.json({ message: 'Sharer user not found', error: `User with email ${sharerEmail} does not exist` }, { status: 404 });
        }

        // Prevent requesting location from self
        if (viewerUser._id.equals(sharerUser._id)) {
            return NextResponse.json({ message: 'Cannot request location from yourself', error: "Self-requesting is not allowed" }, { status: 400 });
        }

        // Check if a permission (active, pending, etc.) already exists for this relationship
        const existingPermission = await SharePermission.findOne({
            sharerId: sharerUser._id, // The one who will share
            viewerId: viewerUser._id, // The one who requested to view
        });

        if (existingPermission) {
            let message = 'Location request already exists';
            if (existingPermission.status === 'active') {
                message = 'You already have active permission to view this user\'s location.';
            } else if (existingPermission.status === 'pending_request') {
                message = 'A pending request to this user already exists.';
            } else if (existingPermission.status === 'rejected') {
                message = 'Your previous request to this user was rejected.';
            } else if (existingPermission.status === 'paused') {
                message = 'Sharing with this user is currently paused.';
            }
            return NextResponse.json({ message, permission: existingPermission }, { status: 200 });
        }

        // Create a new SharePermission document with 'pending_request' status
        const newPermission = await SharePermission.create({
            sharerId: sharerUser._id, // The user whose location is being requested
            viewerId: viewerUser._id, // The user who is making the request
            status: 'pending_request', // Crucial: Set to pending
        });

        return NextResponse.json({ message: "Location request sent successfully", permission: newPermission }, { status: 201 });

    } catch (error) {
        console.error("Error in POST /api/sharing:", error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        // if (error.code === 11000) { // MongoDB duplicate key error
        //     return NextResponse.json({ message: 'Duplicate request', error: 'A request for this sharing relationship already exists.' }, { status: 409 });
        // }
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}