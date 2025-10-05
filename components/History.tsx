
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
    items: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onUse: (imageUrl: string) => void;
}

const History: React.FC<HistoryProps> = ({ items, onSelect, onUse }) => {
    return (
        <div className="w-full">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 -mr-2">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4 animate-fade-in">
                        <img 
                            src={item.resultImageUrl} 
                            alt="History item" 
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-gray-700"
                        />
                        <div className="flex-grow overflow-hidden">
                            <p className="text-sm text-gray-300 truncate" title={item.prompt}>
                                "{item.prompt}"
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(item.timestamp).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                                onClick={() => onSelect(item)}
                                className="text-xs bg-gray-700 text-white font-semibold py-1 px-2 rounded-md hover:bg-gray-600 transition-colors"
                                title="View this result"
                                aria-label={`View result for prompt: ${item.prompt}`}
                            >
                                View
                            </button>
                            <button
                                onClick={() => onUse(item.resultImageUrl)}
                                className="text-xs bg-cyan-600 text-white font-semibold py-1 px-2 rounded-md hover:bg-cyan-500 transition-colors"
                                title="Use this image for a new edit"
                                aria-label={`Use result for a new edit from prompt: ${item.prompt}`}
                            >
                                Use
                            </button>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default History;
