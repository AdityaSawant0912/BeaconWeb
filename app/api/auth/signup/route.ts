import { NextResponse } from 'next/server';
import dbconnect from '@/lib/dbconnect';
import User from '@/models/Users';

export async function POST(req: Request) {
  try {
    await dbconnect();

    const { name, email, password, image } = await req.json();

    if (!name || !email || !password || !image) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    const newUser = new User({ name, email, password, image });
    await newUser.save();

    return NextResponse.json({ message: 'User created successfully.' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}