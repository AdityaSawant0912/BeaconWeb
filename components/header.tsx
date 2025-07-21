"use client"
import LoginButton from "./loginButton";

export default function Header() {

    return (
        <div className="h-15 bg-red-300 w-full flex justify-between px-5">
            <div className="h-full bg-amber-100 flex items-center justify-center">
                Ham
            </div>
            <div className="h-full flex items-center justify-center">
                Logo
            </div>
           <LoginButton />
        </div>
    )
}