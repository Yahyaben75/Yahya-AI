import React from 'react';
import { AppState, EditResult } from '../types';
import Spinner from './Spinner';
import { IconDownload, IconPhotoEdit } from './Icon';

interface ResultDisplayProps {
    appState: AppState;
    originalImageUrl: string | null;
    result: EditResult | null;
    error: string | null;
    onUseImage?: (imageUrl: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ appState, originalImageUrl, result, error, onUseImage }) => {
    
    const handleDownload = (imageUrl: string) => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        const filename = `yahya-ai-${Date.now()}.png`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderContent = () => {
        switch (appState) {
            case AppState.PROCESSING:
                return (
                    <div className="relative w-full h-full">
                        {originalImageUrl && (
                            <img src={originalImageUrl} alt="Processing" className="w-full h-full object-contain opacity-20" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <Spinner className="w-16 h-16 text-cyan-400" />
                            <p className="mt-4 text-lg">{originalImageUrl ? 'Editing your photo...' : 'Generating your image...'}</p>
                        </div>
                    </div>
                );
            case AppState.SUCCESS:
                if (!result) return null;
                // Render side-by-side for edits
                if (originalImageUrl) {
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold text-gray-300 mb-2">Original</h3>
                                <div className="aspect-square w-full rounded-lg overflow-hidden border border-gray-700">
                                    <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Edited</h3>
                                <div className="aspect-square w-full rounded-lg overflow-hidden border border-cyan-500">
                                    <img src={result.imageUrl} alt="Edited" className="w-full h-full object-contain" />
                                </div>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {onUseImage && (
                                        <button
                                            onClick={() => onUseImage(result.imageUrl)}
                                            className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-cyan-600"
                                            aria-label="Use this edited image for a new edit"
                                        >
                                            <IconPhotoEdit className="w-5 h-5" />
                                            Edit This Image
                                        </button>
                                    )}
                                     <button
                                        onClick={() => handleDownload(result.imageUrl)}
                                        className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-green-600"
                                        aria-label="Download this edited image"
                                    >
                                        <IconDownload className="w-5 h-5" />
                                        Download
                                    </button>
                                </div>
                            </div>
                            {result.text && (
                                <p className="md:col-span-2 text-center text-gray-400 mt-2 p-3 bg-gray-800/50 rounded-md">
                                    {result.text}
                                </p>
                            )}
                        </div>
                    );
                }
                // Render single image for generations
                return (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Generated Image</h3>
                        <div className="w-full max-w-[80%] aspect-square rounded-lg overflow-hidden border border-cyan-500">
                            <img src={result.imageUrl} alt="Generated" className="w-full h-full object-contain" />
                        </div>
                         <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {onUseImage && (
                                <button
                                    onClick={() => onUseImage(result.imageUrl)}
                                    className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-cyan-600"
                                    aria-label="Use this generated image for a new edit"
                                >
                                    <IconPhotoEdit className="w-5 h-5" />
                                    Edit This Image
                                </button>
                            )}
                            <button
                                onClick={() => handleDownload(result.imageUrl)}
                                className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors hover:bg-green-600"
                                aria-label="Download this generated image"
                            >
                                <IconDownload className="w-5 h-5" />
                                Download
                            </button>
                        </div>
                    </div>
                );
            case AppState.ERROR:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-red-400">
                        <h3 className="text-xl font-bold">Error</h3>
                        <p className="mt-2 text-center">{error}</p>
                    </div>
                );
            case AppState.IDLE:
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <IconPhotoEdit className="w-24 h-24" />
                        <h3 className="mt-4 text-xl font-semibold">Your image will appear here</h3>
                        <p className="mt-1 text-center">Upload an image to edit, or just write a prompt to generate.</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center">
            {renderContent()}
        </div>
    );
};

export default ResultDisplay;