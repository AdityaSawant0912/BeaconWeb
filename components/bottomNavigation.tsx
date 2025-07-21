type BottomNavigationProps = {
    onOverlayToggle: (overlay: string) => void;
    activeOverlay: string;
};

export default function BottomNavigation({ onOverlayToggle, activeOverlay }: BottomNavigationProps) {
    return (
        <nav className='flex justify-around items-center h-full'>
            <button
                onClick={() => onOverlayToggle('details')}
                className={`px-4 py-2 rounded ${activeOverlay === 'details' ? 'bg-gray-100' : 'hover:bg-gray-700'}`}
            >
                Details
            </button>
            <button
                onClick={() => onOverlayToggle('fences')}
                className={`px-4 py-2 rounded ${activeOverlay === 'fences' ? 'bg-gray-100' : 'hover:bg-gray-700'}`}
            >
                Fences
            </button>
            <button
                onClick={() => onOverlayToggle('settings')}
                className={`px-4 py-2 rounded ${activeOverlay === 'settings' ? 'bg-gray-100' : 'hover:bg-gray-700'}`}
            >
                Settings
            </button>
        </nav>
    );
};
