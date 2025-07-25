// app/api/sharepermission/[id]/accept/route.ts (or pages/api/sharepermission/[id]/accept.ts)

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/Users';
import SharePermission from '@/models/SharePermission';

/**
 * @route PUT /api/sharepermission/:id/accept
 * @description Accepts a pending location request. The authenticated user must be the sharer (who was requested).
 * @param request - NextRequest object.
 * @param params - Contains the 'id' of the SharePermission document.
 * @returns NextResponse with success message and the updated permission.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Get permission ID from URL params

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
            console.log("No current user");
            
            return NextResponse.json({ message: 'User not found', error: "User associated with session email does not exist" }, { status: 404 });
        }

        // Find the permission and ensure it's a pending request *for the current user*
        const permission = await SharePermission.findOne({
            _id: id,
            sharerId: currentUser._id, // Current user must be the viewer (who was requested)
            status: 'pending_request'
        });

        if (!permission) {
            return NextResponse.json({ message: "Request not found or not pending for this user", error: "Permission does not exist or is not a pending request for your account" }, { status: 404 });
        }

        // Update status to 'active'
        permission.status = 'active';
        await permission.save();

        // Optionally, populate viwer details for the response
        const acceptedPermission = await permission.populate('viewerId', 'name email image');

        return NextResponse.json({ message: "Location request accepted successfully", acceptedPermission });

    } catch (error) {
        console.error("Error in PUT /api/sharepermission/[id]/accept:", error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}