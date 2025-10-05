
import React from 'react';

interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, disabled }) => {
    return (
        <div className="w-full">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Describe your edit or generation
            </label>
            <textarea
                id="prompt"
                rows={4}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={disabled ? "Processing..." : "e.g., 'Add a soaring eagle' or 'A futuristic city at sunset'"}
                className="w-full bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
};

export default PromptInput;
