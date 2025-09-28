
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import ResultDisplay from './components/ResultDisplay';
import { IconSparkles } from './components/Icon';
import { AppState, EditResult } from './types';
import { editImage, fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [result, setResult] = useState<EditResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const originalImageUrl = useMemo(() => {
        if (!imageFile) return null;
        return URL.createObjectURL(imageFile);
    }, [imageFile]);

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        setResult(null);
        setError(null);
        setAppState(AppState.IDLE);
    };
    
    const handleSubmit = async () => {
        if (!imageFile || !prompt) {
            setError("Please provide an image and a prompt.");
            setAppState(AppState.ERROR);
            return;
        }

        setAppState(AppState.PROCESSING);
        setError(null);
        setResult(null);

        try {
            const base64Image = await fileToBase64(imageFile);
            const editResult = await editImage(base64Image, imageFile.type, prompt);
            setResult(editResult);
            setAppState(AppState.SUCCESS);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(errorMessage);
            setAppState(AppState.ERROR);
        }
    };
    
    const isEditingDisabled = appState === AppState.PROCESSING || !imageFile;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 selection:bg-cyan-500/30">
            <div className="w-full max-w-6xl mx-auto">
                <Header />
                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
                    {/* Control Panel */}
                    <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-lg p-6 flex flex-col items-start gap-6 h-fit">
                        <h2 className="text-2xl font-bold text-gray-100">1. Upload Image</h2>
                        <ImageUploader onImageSelect={handleImageSelect} imageFile={imageFile} />
                        
                        <h2 className="text-2xl font-bold text-gray-100 mt-4">2. Describe Edit</h2>
                        <PromptInput
                            value={prompt}
                            onChange={setPrompt}
                            disabled={!imageFile}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={isEditingDisabled}
                            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <IconSparkles className="w-6 h-6" />
                            {appState === AppState.PROCESSING ? 'Editing...' : 'Generate Edit'}
                        </button>
                    </div>

                    {/* Result Display */}
                    <div className="lg:col-span-3 min-h-[60vh] lg:min-h-0">
                       <ResultDisplay 
                          appState={appState}
                          originalImageUrl={originalImageUrl}
                          result={result}
                          error={error}
                       />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
