
import React, { useRef, useState, useEffect } from 'react';
import { IconUpload } from './Icon';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    imageFile: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, imageFile }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [imageFile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onImageSelect(event.target.files[0]);
        }
    };

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
            {previewUrl ? (
                <div className="relative group aspect-square w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-600">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <div
                        onClick={handleButtonClick}
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        <span className="text-lg font-semibold">Change Image</span>
                    </div>
                </div>
            ) : (
                <div
                    onClick={handleButtonClick}
                    className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                    <IconUpload className="w-12 h-12 mb-2" />
                    <span className="font-semibold">Click to upload an image</span>
                    <span className="text-sm">PNG, JPG, WEBP</span>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
