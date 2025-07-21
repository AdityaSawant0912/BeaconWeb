

type DetailsOverlayProps = {
    onClose: () => void;
};

export default function DetailsOverlay({ }: DetailsOverlayProps) {

    return (
        <div className={`absolute bottom-16 bg-white p-4 shadow-lg z-20 transition-transform duration-300 transform translate-y-0 left-0 right-0`}>

            <h2 className='text-lg font-bold mb-2'>Place Details</h2>
            <p>Information about the selected location goes here.</p>
            {/* <button onClick={onClose} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'>Close</button> */}
        </div>
    )
}