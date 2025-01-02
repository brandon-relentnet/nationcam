"use client";

import { useState } from 'react';

const PasswordProtection = (WrappedComponent, correctPassword) => {
    return function PasswordProtectedComponent(props) {
        const [inputPassword, setInputPassword] = useState('');
        const [isAuthorized, setIsAuthorized] = useState(false);

        const handleSubmit = (e) => {
            e.preventDefault();
            if (inputPassword === correctPassword) {
                setIsAuthorized(true);
            } else {
                alert('Incorrect password');
            }
        };

        if (isAuthorized) {
            return <WrappedComponent {...props} />;
        }

        return (
            <div className="w-full h-screen flex flex-col items-center justify-center">
                <h1 className="mb-4 text-center">Admin Page Access</h1>
                <div className="flex flex-col items-center w-11/12 sm:w-1/4 p-4">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                        <input
                            type="password"
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            placeholder="Enter password"
                            className="bg-surface0 hover:bg-surface1 p-2 border-2 border-transparent rounded focus:border-accent transition duration-300 outline-none"
                        />
                        <button
                            type="Access"
                            className="bg-surface1 text-subtext0 hover:text-base p-2 rounded hover:bg-accent transition duration-300"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        );
    };
};

export default PasswordProtection;
