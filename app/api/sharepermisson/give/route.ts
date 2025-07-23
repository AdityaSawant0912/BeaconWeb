import { auth } from '@/lib/auth';
import dbconnect from '@/lib/dbconnect';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/Users'; // Assuming User model is available
import SharePermission from '@/models/SharePermission'; // Assuming SharePermission model is defined from SharePermissionSchema