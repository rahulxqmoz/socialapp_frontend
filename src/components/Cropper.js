import React, { forwardRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const ImageCropper = forwardRef(({ modalImage, onSave, onClose, imageType }, ref) => {
  // Adjust settings based on image type
  const aspectRatio = imageType === 'cover' ? 16 / 9 : 1; // 1:1 for profile, 16:9 for cover

  return (
    <div className="relative">
      <Cropper
        src={modalImage}
        style={{ height: 400, width: '100%' }}
        aspectRatio={aspectRatio} // Dynamically set aspect ratio
        guides={false}
        ref={ref} // forward ref to parent component
        viewMode={1}
        autoCropArea={1}
        scalable={false}
        zoomable={true} // Allow zooming for cover pic to adjust size
        movable={true} // Allow moving the crop box
        cropBoxResizable={imageType === 'cover'} // Allow resizing for cover picture
      />
      <button
        onClick={onSave}
        className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600"
      >
        Save
      </button>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-gray-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-600"
      >
        Close
      </button>
    </div>
  );
});


export default ImageCropper;
