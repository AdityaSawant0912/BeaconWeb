import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

interface ShareButtonProps {
    img: string,
    id: string,
    active: string | null
    onClick: (id: string) => void
}

export default function ShareButton({ img, id, active, onClick }: ShareButtonProps) {
    const [showActionButtons, setShowActionButtons] = useState(false); // New state to control visibility

    useEffect(() => {
        if (active === id) {
            setShowActionButtons(true)
        } else {
            setShowActionButtons(false)
        }
    }, [id, active])


    const handleCenterMap = () => {
        console.log("Centering map on selected person...");
        // Implement map centering logic here
    };

    const handleOpenSettings = () => {
        console.log("Opening settings overlay for selected person...");
        // Implement logic to open settings overlay here
        // This will likely involve another state in this component or a global state management
    };
    return (
        <div className="relative" key={id}>
            <button
                onClick={() => onClick(id)} // Pass the click handler
                className={`rounded-full overflow-hidden w-10 h-10 flex items-center justify-center bg-black border-2 ${showActionButtons ? 'border-green-600' : 'border-white'}`} // Added border for your image
                title="Toggle Actions" // Added a title for accessibility
            >
                {img ? (
                    <img src={img} alt="User Profile" width={40} height={40} className="rounded-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">No Img</div> // Fallback
                )}
            </button>

            {/* Action Buttons (conditionally rendered with transition) */}
            <div
                className={`bg-white/30 p-1 backdrop-invert backdrop-opacity-30 shadow-xl rounded-2xl flex gap-1.5 transition-all duration-300 ease-in-out overflow-hidden absolute top-0 left-13 ${showActionButtons ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0' // Adjust max-w based on your button sizes
                    }`}
            >
                <button
                    onClick={handleCenterMap}
                    className="p-2 bg-blue-500 text-white rounded-full text-xs shadow-md hover:bg-blue-600 transition-colors"
                    title="Center Map"
                >
                    <Icon name="map-marker" size={'20px'} />
                </button>
                <button
                    onClick={handleOpenSettings}
                    className="p-2 bg-gray-600 text-white rounded-full text-xs shadow-md hover:bg-gray-700 transition-colors"
                    title="Settings"
                >
                    <Icon name="cog" size={'20px'} />
                </button>
            </div>
        </div>

    );
}