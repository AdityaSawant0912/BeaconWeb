"use client"
import { signOut, useSession } from "next-auth/react"
import { signIn } from "next-auth/react";


export default function LoginButton() {
    const { data: session, status } = useSession()

    const GoogleLogo = "https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw"

    const onClickHandler = () => {
        if (status === 'unauthenticated') {
            signIn("google", {callbackUrl: "/map"})
        } if (status === 'authenticated') {
            signOut()
        }
    }
    console.log(session);
    

    return (
        <button className="h-full flex items-center justify-center" onClick={() => { onClickHandler() }}>
            {/*  eslint-disable-next-line @next/next/no-img-element */}
            <img src={status === "unauthenticated" ? GoogleLogo : status === "authenticated" ? session.user?.image || "" : GoogleLogo} alt="signin" className="rounded-full h-10" />
        </button>
    )
}