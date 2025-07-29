import { useSharePermissions } from "@/context/SharePermissionsContext";
import Icon from "../Icon";

type StatusOverlayProps = object

const StatusOverlay: React.FC<StatusOverlayProps> = () => {
    const { isNativeSharingLocationActive } = useSharePermissions()
    
    return (
        <div className={`absolute top-16 p-1.5 bg-white/30 backdrop-blur-sm shadow-xl z-20 right-4 rounded-2xl flex flex-row gap-1.5`}>
            <div className={`w-8 h-8 rounded-full ${isNativeSharingLocationActive ? "bg-green-500/60" : "bg-red-500/60"} text-white shadow-md flex items-center justify-center text-3xl`}>
                <Icon name={isNativeSharingLocationActive ? "location-share" : "location-share-off"} size={'15px'} />
            </div>
        </div>
    )
}

export default StatusOverlay