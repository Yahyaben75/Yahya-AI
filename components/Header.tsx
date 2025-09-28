import React from 'react';
import { IconPhotoEdit } from './Icon';

const Header: React.FC = () => {
    return (
        <header className="py-6 px-4 text-center text-white">
            <div className="flex items-center justify-center gap-4">
                <IconPhotoEdit className="w-10 h-10 text-cyan-400" />
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text">
                        YAHYA AI
                    </h1>
                    <p className="text-lg text-gray-400">AI Photo Editor</p>
                </div>
            </div>
        </header>
    );
};

export default Header;