
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
export default function ShareOverlay() {
    const { data: session } = useSession()
    const [permissions, setPermissions] = useState([]);
    console.log(permissions)
    useEffect(() => {
        fetch('/api/sharing', {
            method: "GET"
        })
            .then((data) => data.json())
            .then((res) => {
                setPermissions(res.permissions)
            })
        return () => {

        };
    }, []);

    if (!session) {
        return <></>
    }
    return (
        <div className={`absolute top-16 p-1 bg-white/30 backdrop-invert backdrop-opacity-30 shadow-xl z-20 left-4 rounded-2xl flex flex-col gap-1.5`}>

            <img src={session.user?.image} alt="Somealt" className="rounded-full h-10" />
            <img src={session.user?.image} alt="Somealt" className="rounded-full h-10" />
            <img src={session.user?.image} alt="Somealt" className="rounded-full h-10" />
            <img src={session.user?.image} alt="Somealt" className="rounded-full h-10" />

        </div>
    )
}