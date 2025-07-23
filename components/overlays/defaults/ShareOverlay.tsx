// components/ShareOverlay.js
import Icon from "@/components/Icon";
import ShareButton from "@/components/shareButton"; // Assuming this is your current ShareButton
import { useOverlayManager } from "@/context/OverlayContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AddPermissonOverlay from "../AddPermissonOverlay";
import { ExclusiveOverlays, OverlayType } from "@/types/enums";


export default function ShareOverlay() {
    const { data: session } = useSession();
    const [permissions, setPermissions] = useState([]);
    const [active, setActive] = useState<string | null>(null);
    // --- Use the Overlay Manager Hook ---
    const { isOverlayActive, toggleOverlay ,setActiveOverlay} = useOverlayManager();

    useEffect(() => {
        fetch('/api/sharepermisson', {
            method: "GET"
        })
            .then((data) => data.json())
            .then((res) => {
                setPermissions(res.permissions);
            });
        return () => {
            // Cleanup if needed
        };
    }, []);

    const onClick = (id: string) => {
        if (active === id) {
            setActive(null)
            return
        }
        setActive(id)
    }


    const handleAddPermission = (name: string) => {

    }

    const handleAddViewer = () => {
        setActive(null)
        toggleOverlay(ExclusiveOverlays.ADD_PERMISSION, OverlayType.EXCLUSIVE)
        // Implement logic to add viewer, potentially opening another modal/overlay
    };

    if (!session) {
        return <></>;
    }

    return (
        <>
            <div className={`absolute top-16 p-1.5 bg-white/30 backdrop-invert backdrop-opacity-30 shadow-xl z-20 left-4 rounded-2xl flex flex-col gap-1.5`}>
                <ShareButton img={session.user?.image || ''} id={"1"} onClick={onClick} active={active} />
                <ShareButton img={session.user?.image || ''} id={"2"} onClick={onClick} active={active} />

                {/* "Add Viewer" Button - similar to ShareButton but for adding */}
                {/* You might want a dedicated component for this if it's visually distinct */}
                <button
                    onClick={handleAddViewer}
                    className="bg-gray-900/30 text-white rounded-full text-xs shadow-md w-10 h-10 flex items-center justify-center"
                    title="Add New Viewer"
                >
                    <Icon name="plus" size={'20px'} />
                </button>

                {/* Placeholder for the settings overlay if you manage it here */}
                {/* {showSettingsOverlay && <SettingsOverlay onClose={() => setShowSettingsOverlay(false)} />} */}
            </div>
            {isOverlayActive(ExclusiveOverlays.ADD_PERMISSION) && (
                <AddPermissonOverlay
                    onClose={() => {
                        setActiveOverlay(ExclusiveOverlays.ADD_PERMISSION, OverlayType.EXCLUSIVE, false); // Deactivate 'addFence'
                    }}
                    onSave={handleAddPermission}
                />
            )}
        </>
    );
}

