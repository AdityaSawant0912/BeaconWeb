// /api/sharepermission/route.ts

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users'; // Assuming User model is available
import SharePermission from '@/models/SharePermission'; // Assuming SharePermission model is defined from SharePermissionSchema

/**
 * @route POST /api/sharepermission
 * @description Creates a new sharing permission. The authenticated user is the sharer.
 * @param request - The NextRequest object containing the viewer's email in the body.
 * Expected body: { viewerEmail: string }
 * @returns NextResponse with success message and the created permission, or an error.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json(); // Parse the JSON body: { viewerEmail: "viewer@example.com" }
        const session = await auth(); // Get the user session

        // Check if the current user is authenticated
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }

        try {
            await dbconnect(); // Connect to the MongoDB database

            // Find the current authenticated user (sharer)
            const sharerUser = await User.findOne({ email: session.user.email });
            if (!sharerUser) {
                return NextResponse.json({ message: 'Sharer user not found', error: "User associated with session email does not exist" }, { status: 404 });
            }

            // Find the viewer user by their email
            const viewerUser = await User.findOne({ email: body.viewerEmail });
            if (!viewerUser) {
                return NextResponse.json({ message: 'Viewer user not found', error: `User with email ${body.viewerEmail} does not exist` }, { status: 404 });
            }

            // Prevent a user from sharing with themselves
            if (sharerUser._id.equals(viewerUser._id)) {
                return NextResponse.json({ message: 'Cannot share location with yourself', error: "Self-sharing is not allowed" }, { status: 400 });
            }

            // Check if this sharing permission already exists
            const existingPermission = await SharePermission.findOne({
                sharerId: sharerUser._id,
                viewerId: viewerUser._id,
            }); 

            if (existingPermission) {
                return NextResponse.json({ message: 'Sharing permission already exists', permission: existingPermission }, { status: 200 });
            }

            // Create a new SharePermission document
            const permission = await SharePermission.create({
                sharerId: sharerUser._id,
                viewerId: viewerUser._id,
                status: 'active', // Default to active, or 'pending_request' if you implement acceptance flow
            });

            return NextResponse.json({ message: "Sharing permission created successfully", permission });
        } catch (error) {
            console.error("Database Error in POST /api/sharepermission:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }

    } catch (error) {
        console.error("Internal Server Error in POST /api/sharepermission:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route GET /api/sharepermission
 * @description Retrieves sharing permissions where the current user is either the sharer or the viewer.
 * @param request - The NextRequest object.
 * @returns NextResponse with an array of share permissions.
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

            // Find permissions where the current user is the sharer OR the viewer
            const permissions = await SharePermission.find({
                $or: [
                    { sharerId: currentUserId },
                    { viewerId: currentUserId }
                ]
            })
            .populate('sharerId', 'name email image') // Populate sharer details
            .populate('viewerId', 'name email image'); // Populate viewer details

            return NextResponse.json({ permissions });

        } catch (error) {
            console.error("Database Error in GET /api/sharepermission:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }
    } catch (error) {
        console.error("Internal Server Error in GET /api/sharepermission:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route DELETE /api/sharepermission
 * @description Deletes a specific sharing permission by its ID. Only the sharer can delete it.
 * @param request - The NextRequest object containing the ID in search parameters.
 * @returns NextResponse with a success message or an error.
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Get the SharePermission document ID from query parameters

    // Check if an ID was provided
    if (!id) {
        return NextResponse.json({ message: 'Bad Request', error: "SharePermission ID is required" }, { status: 400 });
    }

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

            // Find the permission to ensure it exists and belongs to the current user as sharer
            const permissionToDelete = await SharePermission.findOne({ _id: id });

            if (!permissionToDelete) {
                return NextResponse.json({ message: "Sharing permission not found" }, { status: 404 });
            }

            // Ensure only the sharer can delete the permission
            if (!permissionToDelete.sharerId.equals(currentUser._id)) {
                return NextResponse.json({ message: 'Unauthorized to delete this permission', error: "Only the sharer can revoke this permission" }, { status: 403 });
            }

            // Delete the permission document
            const result = await SharePermission.deleteOne({ _id: id, sharerId: currentUser._id });

            if (result.deletedCount === 0) {
                // This case should ideally not be hit if permissionToDelete was found and sharerId matched
                return NextResponse.json({ message: "Failed to delete permission" }, { status: 500 });
            }

            return NextResponse.json({ message: "Sharing permission deleted successfully" });

        } catch (error) {
            console.error("Database Error in DELETE /api/sharepermission:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }
    } catch (error) {
        console.error("Internal Server Error in DELETE /api/sharepermission:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}