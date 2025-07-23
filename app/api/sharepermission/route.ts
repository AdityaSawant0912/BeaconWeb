// app/api/sharepermission/route.ts (or pages/api/sharepermission.ts)

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users';
import SharePermission from '@/models/SharePermission';
import Location from '@/models/Location'; // Import Location model to get latest locations
import mongoose, { Types } from 'mongoose';
import { PopulatedIncomingSharePermission, PopulatedOutgoingSharePermission, PopulatedPendingRequestSharePermission, PopulatedSentRequestSharePermission } from '@/types/sharing';

/**
 * Helper function to get the latest location for a user
 * @param userId - MongoDB ObjectId of the user
 * @returns Latest location document or null
 */
async function getLatestLocationForUser(userId: mongoose.Types.ObjectId) {
    const latestLocation = await Location.findOne({ userId })
        .sort({ timestamp: -1 })
        .select('coordinate'); // Only select coordinates
    return latestLocation ? latestLocation.coordinate : null;
}

/**
 * @route GET /api/sharepermission
 * @description Retrieves categorized sharing permissions for the current user:
 * - incoming: Users actively sharing with me.
 * - outgoing: Users I am actively sharing with.
 * - pending: Requests for my location (from others).
 * @param request - The NextRequest object.
 * @returns NextResponse with categorized share permissions.
 */
export async function GET() {
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

        // 1. Incoming Locations (Users sharing with current user)
        const incomingPermissions = await SharePermission.find({
            viewerId: currentUserId,
            status: {
                $in : ['active', 'paused']
            }
        })
            .populate('sharerId', 'name email image'); // Populate sharer's details

        const incomingPromises = incomingPermissions.map(async (permission: PopulatedIncomingSharePermission) => {
            const sharerUser = permission.sharerId; // This is the populated User object
            if (!sharerUser) return null; // Handle case where sharer user might not exist anymore

            const latestLocation = await getLatestLocationForUser(sharerUser._id as unknown as Types.ObjectId);

            return {
                _id: permission._id, // SharePermission ID
                sharerId: sharerUser._id, // Original User ID
                name: sharerUser.name,
                email: sharerUser.email,
                image: sharerUser.image,
                currentLocation: latestLocation, // Attach latest location
                status: permission.status
            };
        });
        const incoming = (await Promise.all(incomingPromises)).filter(Boolean); // Filter out nulls


        // 2. Outgoing Locations (Users current user is sharing with)
        const outgoingPermissions = await SharePermission.find({
            sharerId: currentUserId,
            status: {
                $in : ['active', 'paused']
            }
        })
            .populate('viewerId', 'name email image'); // Populate viewer's details

        const outgoing = outgoingPermissions.map((permission: PopulatedOutgoingSharePermission) => ({
            _id: permission._id, // SharePermission ID
            viewer: {
                _id: permission.viewerId._id,
                name: permission.viewerId.name,
                email: permission.viewerId.email,
                image: permission.viewerId.image,
            },
            status: permission.status // Status of this outgoing share
        }));


        // 3. Pending Requests (Others who have requested current user's location)
        const pendingRequests = await SharePermission.find({
            sharerId: currentUserId,
            status: 'pending_request'
        })
            .populate('viewerId', 'name email image'); // Populate requester's details

        const pending = pendingRequests.map((permission: PopulatedPendingRequestSharePermission) => ({
            _id: permission._id, // SharePermission ID
            requester: {
                _id: permission.viewerId._id, // The one who requested (is the viwer in the permission doc)
                name: permission.viewerId.name,
                email: permission.viewerId.email,
                image: permission.viewerId.image,
            },
            status: permission.status
        }));
        
        // 3. Sent Requests (Others who have requested current user's location)
        const sentRequests = await SharePermission.find({
            viewerId: currentUserId,
            status: 'pending_request'
        })
            .populate('sharerId', 'name email image'); // Populate requester's details

        const sent = sentRequests.map((permission: PopulatedSentRequestSharePermission) => ({
            _id: permission._id, // SharePermission ID
            sharer: {
                _id: permission.sharerId._id, // The one who requested (is the viwer in the permission doc)
                name: permission.sharerId.name,
                email: permission.sharerId.email,
                image: permission.sharerId.image,
            },
            status: permission.status
        }));


        return NextResponse.json({
            incoming,
            outgoing,
            pending,
            sent,
            message: "Share permissions retrieved successfully"
        });

    } catch (error) {
        console.error("Error in GET /api/sharepermission:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route POST /api/sharepermission
 * @description Creates a new sharing permission where the authenticated user is the sharer,
 * defaulting to 'active' status. Use /api/sharing for 'pending_request' flow.
 * @param request - { viewerEmail: string }
 * @returns NextResponse with success message and the created permission.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { viewerEmail } = body;
        const session = await auth();

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized', error: "Forbidden" }, { status: 403 });
        }
        if (!viewerEmail) {
            return NextResponse.json({ message: 'Bad Request', error: 'Viewer email is required.' }, { status: 400 });
        }

        await dbconnect();

        const sharerUser = await User.findOne({ email: session.user.email });
        if (!sharerUser) {
            return NextResponse.json({ message: 'Sharer user not found', error: "User associated with session email does not exist" }, { status: 404 });
        }

        const viewerUser = await User.findOne({ email: viewerEmail });
        if (!viewerUser) {
            return NextResponse.json({ message: 'Viewer user not found', error: `User with email ${viewerEmail} does not exist` }, { status: 404 });
        }

        if (sharerUser._id.equals(viewerUser._id)) {
            return NextResponse.json({ message: 'Cannot share location with yourself', error: "Self-sharing is not allowed" }, { status: 400 });
        }

        const existingPermission = await SharePermission.findOne({
            sharerId: sharerUser._id,
            viewerId: viewerUser._id,
        });

        if (existingPermission) {
            return NextResponse.json({ message: 'Sharing permission already exists', permission: existingPermission }, { status: 200 });
        }

        const permission = await SharePermission.create({
            sharerId: sharerUser._id,
            viewerId: viewerUser._id,
            status: 'active', // This POST defaults to active
        });

        return NextResponse.json({ message: "Sharing permission created successfully", permission }, { status: 201 });

    } catch (error) {
        console.error("Error in POST /api/sharepermission:", error);
        // if (error.code === 11000) {
        //     return NextResponse.json({ message: 'Duplicate entry', error: 'A permission already exists for this relationship.' }, { status: 409 });
        // }
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}

/**
 * @route DELETE /api/sharepermission
 * @description Deletes a specific sharing permission by its ID.
 * Only the sharer can delete an outgoing permission (stop sharing).
 * Only the viewer can delete an incoming permission (stop viewing).
 * Only the requesting user can delete a pending request they made.
 * Admin can delete any. For simplicity, we'll allow sharer or viewer to delete.
 * @param request - The NextRequest object containing the ID in search parameters.
 * @returns NextResponse with a success message or an error.
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Bad Request', error: "Valid SharePermission ID is required" }, { status: 400 });
    }

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

        // Find the permission to ensure it exists and the current user has authority
        const permissionToDelete = await SharePermission.findOne({ _id: id });

        if (!permissionToDelete) {
            return NextResponse.json({ message: "Sharing permission not found" }, { status: 404 });
        }

        // Authorize: Current user must be either the sharer or the viewer of this permission
        console.log(permissionToDelete.sharerId, permissionToDelete.viewerId, currentUser._id.toString());
        
        const isSharer = permissionToDelete.sharerId === currentUser._id.toString();
        const isViewer = permissionToDelete.viewerId === currentUser._id.toString();

        if (!isSharer && !isViewer) {
            return NextResponse.json({ message: 'Unauthorized to delete this permission', error: "You are neither the sharer nor the viewer of this permission" }, { status: 403 });
        }

        // Delete the permission document
        const result = await SharePermission.deleteOne({ _id: id }); // No need to filter by sharerId/viewerId in deleteOne after finding and authorizing

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Failed to delete permission" }, { status: 500 });
        }

        return NextResponse.json({ message: "Sharing permission deleted successfully" });

    } catch (error) {
        console.error("Error in DELETE /api/sharepermission:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}