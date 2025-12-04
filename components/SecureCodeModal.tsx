"use client"

import React, { useState } from 'react';

interface SecureCodeModalProps {
  onSubmit: (code: string) => void;
}

const SecureCodeModal: React.FC<SecureCodeModalProps> = ({ onSubmit }) => {
  const [secureCode, setSecureCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secureCode.trim()) {
      onSubmit(secureCode);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Secure Code Kiriting</h2>
        <p className="text-gray-600 mb-6 text-center">
          Testni boshlash uchun secure codeni kiriting
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="secureCode" className="block text-sm font-medium text-gray-700 mb-2">
              Secure Code
            </label>
            <input
              type="password"
              id="secureCode"
              value={secureCode}
              onChange={(e) => setSecureCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Secure codeni kiriting..."
              required
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Testni Boshlash
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>Secure codeni ustozingizdan oling</p>
        </div>
      </div>
    </div>
  );
};

export default SecureCodeModal;