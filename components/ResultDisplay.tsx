
import React from 'react';
import { AppState, EditResult } from '../types';
import Spinner from './Spinner';
import { IconPhotoEdit } from './Icon';

interface ResultDisplayProps {
    appState: AppState;
    originalImageUrl: string | null;
    result: EditResult | null;
    error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ appState, originalImageUrl, result, error }) => {
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
                            <p className="mt-4 text-lg">Editing your photo...</p>
                        </div>
                    </div>
                );
            case AppState.SUCCESS:
                if (!result || !originalImageUrl) return null;
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
                        </div>
                        {result.text && (
                            <p className="md:col-span-2 text-center text-gray-400 mt-2 p-3 bg-gray-800/50 rounded-md">
                                {result.text}
                            </p>
                        )}
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
                        <h3 className="mt-4 text-xl font-semibold">Your edited image will appear here</h3>
                        <p className="mt-1 text-center">Upload an image and describe the changes to get started.</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-gray-800/50 border border-gray-700 rounded-lg">
            {renderContent()}
        </div>
    );
};

export default ResultDisplay;
