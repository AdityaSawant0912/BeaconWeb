"use client"
import { useSession } from "next-auth/react";
import LoginButton from "./loginButton";
import LogoutButton from "./LogoutButton";

export default function Header() {
    const { data: session } = useSession()
    console.log(session);

    return (
        <div className="h-15 bg-red-300 w-full flex justify-between px-5">
            <div className="h-full bg-amber-100 flex items-center justify-center">
                Ham
            </div>
            <div className="h-full flex items-center justify-center">
                Logo
            </div>
            {session ?
                <LogoutButton /> :
                <LoginButton />
            }
        </div>
    )
}