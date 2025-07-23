// app/api/sharepermission/[id]/stop/route.ts (or pages/api/sharepermission/[id]/stop.ts)

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/Users';
import SharePermission from '@/models/SharePermission';

/**
 * @route PUT /api/sharepermission/:id/stop
 * @description Stops an active sharing permission (sets status to 'paused' or 'rejected').
 * The authenticated user must be the sharer.
 * @param request - NextRequest object.
 * @param params - Contains the 'id' of the SharePermission document.
 * @returns NextResponse with success message.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

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

        // Find the permission and ensure current user is the sharer
        const permission = await SharePermission.findOne({
            _id: id,
            sharerId: currentUser._id, // Current user must be the sharer (the one stopping)
            status: 'active' // Only allow stopping active permissions
        });

        if (!permission) {
            return NextResponse.json({ message: "Permission not found or not active for your account", error: "Permission does not exist or is not an active outgoing share for your account" }, { status: 404 });
        }

        // Set status to 'paused' (or 'rejected' if it means permanent stop)
        permission.status = 'paused';
        await permission.save();

        return NextResponse.json({ message: "Sharing permission paused successfully" });

    } catch (error) {
        console.error("Error in PUT /api/sharepermission/[id]/stop:", error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}