import Overlay from "./overlay";

type DetailsOverlayProps = {
    onClose: () => void;
};

export default function DetailsOverlay({ onClose }: DetailsOverlayProps) {

    return ( 
        <Overlay className="left-5 right-5 bottom-16">
            <h2 className='text-lg font-bold mb-2'>Place Details</h2>
            <p>Information about the selected location goes here.</p>
            {/* <button onClick={onClose} className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'>Close</button> */}
        </Overlay>
    )
}