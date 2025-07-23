import React, { useState } from 'react';
import Icon from "@/components/Icon";

interface AddPermissonOverlayProps {
  onClose: () => void;
  onSave: (name: string) => void
}

const AddPermissonOverlay: React.FC<AddPermissonOverlayProps> = ({ onClose, onSave}) => {
  const [viewerEmail, setViewerEmail] = useState('');
  const handleSave = () => {
    if (viewerEmail.trim() === '') {
      alert('Please enter a email name.');
      return;
    }
    fetch('/api/sharing', {
      method: 'POST',
      body: JSON.stringify({sharerEmail: viewerEmail})
    })
    .then(data => data.json())
    .then(res => {
      if(!res.ok) {
        alert(res.message)
      } else {
        onSave(res.user)
      }
    })
  };


  return (
    <div className="absolute bottom-16 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg z-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add Location</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <Icon name='close' size={'25px'}/>
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="viewerEmail" className="block text-sm font-medium text-gray-700">
          Sharer&apos;s email
        </label>
        <div className='flex flex-row justify-center items-center gap-3 mt-1'>
          <input
            type="email"
            id="viewerEmail"
            className=" block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={viewerEmail}
            onChange={(e) => setViewerEmail(e.target.value)}
            placeholder="john.doe@gmail.com"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded-md w-full disabled:opacity-50"
        disabled={viewerEmail.trim() === ''}
      >
        Get Permission
      </button>
    </div>
  );
};

export default AddPermissonOverlay;