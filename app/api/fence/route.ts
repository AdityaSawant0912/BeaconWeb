import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users'; // Assuming User model is available
import Fence from '@/models/Fences'; // Assuming Fence model is defined

/**
 * @route POST /api/fence
 * @description Creates a new fence record for the authenticated user.
 * @param request - The NextRequest object containing the fence data in the body.
 * Expected body: { fence: { name: string, coordinates: [...], radius: number, ... } }
 * @returns NextResponse with success message and the created fence, or an error.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json(); // Parse the JSON body from the request
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

            // Create a new Fence document
            const fence = await Fence.create({
                ...body.fence,
                createdBy: user._id // Use userId (ObjectId) instead of email
            });

            return NextResponse.json({ message: "Fence inserted successfully", fence });
        } catch (error) {
            console.error("Database Error in POST /api/fence:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }

    } catch (error) {
        console.error("Internal Server Error in POST /api/fence:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route GET /api/fence
 * @description Retrieves all fence records created by the authenticated user.
 * @param request - The NextRequest object.
 * @returns NextResponse with an array of fence records, or an empty array.
 */
export async function GET(request: NextRequest) {
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

            // Retrieve all fence records created by the user
            const fences = await Fence.find({ createdBy: user._id });

            return NextResponse.json({ fences });

        } catch (error) {
            console.error("Database Error in GET /api/fence:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }
    } catch (error) {
        console.error("Internal Server Error in GET /api/fence:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}

/**
 * @route DELETE /api/fence
 * @description Deletes a specific fence record by its ID for the authenticated user.
 * @param request - The NextRequest object containing the ID in search parameters.
 * @returns NextResponse with a success message or an error.
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Get the Fence document ID from query parameters

    // Check if an ID was provided
    if (!id) {
        return NextResponse.json({ message: 'Bad Request', error: "Fence ID is required" }, { status: 400 });
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

            // Delete the fence document, ensuring it belongs to the authenticated user
            const result = await Fence.deleteOne({ _id: id, createdBy: user._id });

            if (result.deletedCount === 0) {
                return NextResponse.json({ message: "Fence not found or not authorized to delete" }, { status: 404 });
            }

            return NextResponse.json({ message: "Fence deleted successfully" });

        } catch (error) {
            console.error("Database Error in DELETE /api/fence:", error);
            return NextResponse.json({ message: 'Database Error', error: error }, { status: 500 });
        }
    } catch (error) {
        console.error("Internal Server Error in DELETE /api/fence:", error);
        return NextResponse.json({ message: 'Internal Server Error', error: error }, { status: 500 });
    }
}
