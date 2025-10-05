import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import ResultDisplay from './components/ResultDisplay';
import { IconSparkles, IconChevronUp, IconChevronDown } from './components/Icon';
import { AppState, EditResult, HistoryItem } from './types';
import { editImage, fileToBase64, generateImage } from './services/geminiService';
import History from './components/History';
import { dataURLtoFile } from './utils';

const App: React.FC = () => {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [result, setResult] = useState<EditResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [maxFiles, setMaxFiles] = useState<number>(8);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [viewingHistoryItem, setViewingHistoryItem] = useState<HistoryItem | null>(null);
    const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(true);


    const previewUrls = useMemo(() => imageFiles.map(file => URL.createObjectURL(file)), [imageFiles]);
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const originalImageUrl = useMemo(() => {
        if (activeImageIndex === null || !previewUrls[activeImageIndex]) return null;
        return previewUrls[activeImageIndex];
    }, [activeImageIndex, previewUrls]);
        
    const displayData = useMemo(() => {
        if (viewingHistoryItem) {
            return {
                appState: AppState.SUCCESS,
                originalImageUrl: viewingHistoryItem.originalImageUrl,
                result: { imageUrl: viewingHistoryItem.resultImageUrl, text: `History: "${viewingHistoryItem.prompt}"`},
                error: null
            };
        }
        return { appState, originalImageUrl, result, error };
    }, [viewingHistoryItem, appState, originalImageUrl, result, error]);

    const handleImageSelect = (newFiles: File[]) => {
        setViewingHistoryItem(null);
        const currentFilesCount = imageFiles.length;
        const remainingSlots = maxFiles - currentFilesCount;
        const filesToAdd = newFiles.slice(0, remainingSlots);

        if (filesToAdd.length < 1) return;

        setImageFiles(prevFiles => [...prevFiles, ...filesToAdd]);

        if (activeImageIndex === null) {
            setActiveImageIndex(currentFilesCount);
        }
        
        setResult(null);
        setError(null);
        setAppState(AppState.IDLE);
    };

    const handleImageRemove = (indexToRemove: number) => {
        setViewingHistoryItem(null);
        setImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        
        if (activeImageIndex === indexToRemove) {
            const newActiveIndex = imageFiles.length > 1 ? 0 : null;
            setActiveImageIndex(newActiveIndex);
        } else if (activeImageIndex !== null && activeImageIndex > indexToRemove) {
            setActiveImageIndex(prevIndex => (prevIndex === null ? null : prevIndex - 1));
        }
    };
    
    const handleImageClick = (index: number) => {
        if (activeImageIndex === index) return;
        setViewingHistoryItem(null);
        setActiveImageIndex(index);
        setResult(null);
        setError(null);
        setAppState(AppState.IDLE);
    };

    const handleUseImage = async (imageUrl: string) => {
        setViewingHistoryItem(null);
        setAppState(AppState.PROCESSING);
        try {
            const filename = `imported-${Date.now()}.png`;
            const file = await dataURLtoFile(imageUrl, filename);

            if (imageFiles.length >= maxFiles) {
                setError(`Cannot add more images. Maximum is ${maxFiles}.`);
                setAppState(AppState.ERROR);
                return;
            }

            const newImageFiles = [...imageFiles, file];
            setImageFiles(newImageFiles);
            setActiveImageIndex(newImageFiles.length - 1);
            
            setResult(null);
            setError(null);
            setAppState(AppState.IDLE);
        } catch (e) {
            setError("Failed to use the image.");
            setAppState(AppState.ERROR);
        }
    };
    
    const handleHistorySelect = (item: HistoryItem) => {
        setViewingHistoryItem(item);
    };

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError("Please provide a prompt.");
            setAppState(AppState.ERROR);
            return;
        }
        
        setViewingHistoryItem(null);
        setAppState(AppState.PROCESSING);
        setError(null);
        setResult(null);

        const activeOriginalUrl = (activeImageIndex !== null && imageFiles[activeImageIndex]) ? originalImageUrl : null;

        try {
            let editResult: EditResult;
            const isEditing = activeImageIndex !== null && imageFiles[activeImageIndex];

            if (isEditing) {
                const activeImageFile = imageFiles[activeImageIndex!];
                const base64Image = await fileToBase64(activeImageFile);
                editResult = await editImage(base64Image, activeImageFile.type, prompt);
            } else {
                editResult = await generateImage(prompt);
            }

            setResult(editResult);
            setAppState(AppState.SUCCESS);

            const newHistoryItem: HistoryItem = {
                id: `hist-${Date.now()}`,
                prompt,
                resultImageUrl: editResult.imageUrl,
                originalImageUrl: activeOriginalUrl,
                timestamp: Date.now()
            };
            setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(errorMessage);
            setAppState(AppState.ERROR);
        }
    };
    
    const isSubmitDisabled = appState === AppState.PROCESSING || !prompt.trim();

    const getButtonText = () => {
        const isEditingMode = activeImageIndex !== null && !viewingHistoryItem;
        if (appState === AppState.PROCESSING) {
            return isEditingMode ? 'Editing...' : 'Generating...';
        }
        return isEditingMode ? 'Generate Edit' : 'Generate Image';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 selection:bg-cyan-500/30">
            <div className="w-full max-w-6xl mx-auto">
                <Header />
                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
                    {/* Control Panel */}
                    <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-start gap-6 h-fit">
                        <div className="w-full flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-100">1. Upload (Optional)</h2>
                            <div className="flex items-center gap-2">
                                <label htmlFor="max-files" className="text-sm font-medium text-gray-300 shrink-0">
                                    Max Images
                                </label>
                                <input
                                    type="number"
                                    id="max-files"
                                    value={maxFiles}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        if (e.target.value === '') {
                                            setMaxFiles(1);
                                        } else if (!isNaN(value)) {
                                            setMaxFiles(Math.max(1, Math.min(50, value)));
                                        }
                                    }}
                                    min="1"
                                    max="50"
                                    className="w-20 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg p-1.5 text-center focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                    aria-label="Set maximum number of images"
                                />
                            </div>
                        </div>
                        <ImageUploader 
                            onImageSelect={handleImageSelect}
                            onImageRemove={handleImageRemove}
                            onImageClick={handleImageClick}
                            imageFiles={imageFiles}
                            previewUrls={previewUrls}
                            activeImageIndex={activeImageIndex}
                            maxFiles={maxFiles}
                        />
                        
                        <h2 className="text-2xl font-bold text-gray-100 mt-4">2. Describe</h2>
                        <PromptInput
                            value={prompt}
                            onChange={setPrompt}
                            disabled={appState === AppState.PROCESSING}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <IconSparkles className="w-6 h-6" />
                            {getButtonText()}
                        </button>
                        
                        {history.length > 0 && (
                            <>
                                <div className="w-full border-t border-gray-700 my-2"></div>
                                <div className="w-full flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-100">History</h2>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setHistory([])} 
                                            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                                            aria-label="Clear history"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                                            className="text-gray-400 hover:text-white transition-colors"
                                            aria-label={isHistoryVisible ? 'Hide history' : 'Show history'}
                                            aria-expanded={isHistoryVisible}
                                        >
                                            {isHistoryVisible ? <IconChevronUp className="w-6 h-6" /> : <IconChevronDown className="w-6 h-6" />}
                                        </button>
                                    </div>
                                </div>
                                {isHistoryVisible && (
                                    <History 
                                        items={history}
                                        onSelect={handleHistorySelect}
                                        onUse={handleUseImage}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Result Display */}
                    <div className="lg:col-span-3 min-h-[60vh] lg:min-h-0">
                       <ResultDisplay 
                          appState={displayData.appState}
                          originalImageUrl={displayData.originalImageUrl}
                          result={displayData.result}
                          error={displayData.error}
                          onUseImage={handleUseImage}
                       />
                    </div>
                </main>
            </div>
            <footer className="w-full text-center text-gray-500 py-4 mt-auto">
                <p>this app by YAHYA BENMOUSSA🇲🇦</p>
            </footer>
        </div>
    );
};

export default App;