// components/overlays/RequestLocationOverlay.tsx (formerly AddPermissonOverlay.tsx)

"use client";

import React, { useState, useCallback } from 'react';
import Icon from "@/components/Icon"; // Assuming this is your Icon component
import { useSharePermissions } from '@/hooks/useSharePermissions'; // NEW: Import the hook

interface RequestLocationOverlayProps { // Renamed interface
  onClose: () => void;
  // onSave prop removed, as the request logic is now within the hook
  // You might add an optional onSuccess callback if the parent needs to react specifically to success
}

const RequestLocationOverlay: React.FC<RequestLocationOverlayProps> = ({ onClose }) => {
  const { requestLocation } = useSharePermissions(); // NEW: Get requestLocation from hook

  const [viewerEmail, setViewerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerEmail.trim()) {
      setStatusMessage("Please enter an email address.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      // NEW: Call the requestLocation from useSharePermissions hook
      const success = await requestLocation(viewerEmail);
      
      if (success) {
        setStatusMessage("Location request sent successfully!");
        setIsError(false);
        setViewerEmail(''); // Clear the input
        // Optionally, close the overlay after a short delay
        setTimeout(() => {
          onClose(); // Close this overlay
          // Optionally, activate the "Pending Requests" tab in BeaconHub after closing this
          // setActiveOverlay(ExclusiveOverlays.BEACON_HUB, OverlayType.EXCLUSIVE, true);
        }, 1500);
      } else {
        // Error message set by useSharePermissions hook, but can be overridden here if needed
        setStatusMessage("Failed to send request. Please check the email or try again.");
        setIsError(true);
      }
    } catch (error) { // Catch potential errors not handled by requestLocation's return
      console.error("Error sending request from overlay:", error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      setStatusMessage(errorMessage || "An unexpected error occurred.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [viewerEmail, requestLocation, onClose]);

  return (
    <div className="absolute bottom-16 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg z-20  flex flex-col"> {/* Adjusted height */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Request Location</h2> {/* Updated title */}
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name='close' size={'25px'} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-between">
        <div className="mb-4">
          <label htmlFor="viewerEmail" className="block text-sm font-medium text-gray-700">
            User&apos;s Email to Request Location From
          </label>
          <div className='flex flex-row justify-center items-center gap-3 mt-1'>
            <input
              type="email"
              id="viewerEmail"
              className=" block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={viewerEmail}
              onChange={(e) => setViewerEmail(e.target.value)}
              placeholder="john.doe@gmail.com"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {statusMessage && (
          <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'} mb-4`}>
            {statusMessage}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md w-full disabled:opacity-50"
          disabled={isSubmitting || !viewerEmail.trim()} // Disable if email is empty
        >
          {isSubmitting ? 'Sending Request...' : 'Send Location Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestLocationOverlay;