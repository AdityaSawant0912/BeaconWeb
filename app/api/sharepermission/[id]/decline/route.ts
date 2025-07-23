// app/api/sharepermission/[id]/decline/route.ts (or pages/api/sharepermission/[id]/decline.ts)

import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/Users';
import SharePermission from '@/models/SharePermission';

/**
 * @route PUT /api/sharepermission/:id/decline
 * @description Declines a pending location request. The authenticated user must be the sharer.
 * @param request - NextRequest object.
 * @param params - Contains the 'id' of the SharePermission document.
 * @returns NextResponse with success message.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

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

        const permission = await SharePermission.findOne({
            _id: id,
            sharerId: currentUser._id, // Current user must be the viewer
            status: 'pending_request'
        });

        if (!permission) {
            return NextResponse.json({ message: "Request not found or not pending for this user", error: "Permission does not exist or is not a pending request for your account" }, { status: 404 });
        }

        // Update status to 'rejected'
        // permission.status = 'rejected';
        // await permission.save();
        // Alternatively, you could delete the permission instead of setting to 'rejected'
        await SharePermission.deleteOne({ _id: id });

        return NextResponse.json({ message: "Location request declined & deleted successfully" });

    } catch (error) {
        console.error("Error in PUT /api/sharepermission/[id]/decline:", error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
    }
}