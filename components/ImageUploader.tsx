import React, { useRef } from 'react';
import { IconUpload, IconX } from './Icon';

interface ImageUploaderProps {
    onImageSelect: (files: File[]) => void;
    onImageRemove: (index: number) => void;
    onImageClick: (index: number) => void;
    imageFiles: File[];
    previewUrls: string[];
    activeImageIndex: number | null;
    maxFiles: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageSelect, 
    onImageRemove,
    onImageClick,
    imageFiles,
    previewUrls,
    activeImageIndex,
    maxFiles 
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onImageSelect(Array.from(event.target.files));
        }
        event.target.value = ''; // Allow re-uploading the same file(s)
    };

    const handleUploadClick = () => {
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
                multiple
                disabled={imageFiles.length >= maxFiles}
            />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {previewUrls.map((url, index) => {
                    const isActive = index === activeImageIndex;
                    return (
                        <div key={`${imageFiles[index].name}-${index}`} className="relative group aspect-square">
                            <button
                                onClick={() => onImageClick(index)}
                                className={`w-full h-full rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                                    isActive 
                                        ? 'border-cyan-400 ring-2 ring-cyan-400' 
                                        : 'border-gray-600 hover:border-gray-400'
                                }`}
                                aria-label={`Select image ${index + 1}`}
                            >
                                <img 
                                    src={url} 
                                    alt={`Preview ${index + 1}`} 
                                    className="w-full h-full object-cover" 
                                />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onImageRemove(index);
                                }}
                                className="absolute top-1 right-1 bg-gray-900/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label={`Remove image ${index + 1}`}
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}

                {imageFiles.length < maxFiles && (
                    <button
                        onClick={handleUploadClick}
                        className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        aria-label="Upload new images"
                    >
                        <IconUpload className="w-10 h-10 mb-1" />
                        <span className="text-sm font-semibold text-center">
                            Upload
                        </span>
                        <span className="text-xs">{imageFiles.length}/{maxFiles}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
