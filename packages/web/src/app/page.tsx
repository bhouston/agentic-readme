/**
 * Home page for the Agentic README Service
 */

import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Agentic README Service
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Automatically generate high-quality, AI-friendly README files for npm libraries
          </p>
        </div>
        
        <div className="mt-16 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Generate a README
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Enter an npm package name to generate a README
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form className="space-y-6">
              <div>
                <label htmlFor="package-name" className="block text-sm font-medium text-gray-700">
                  Package Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="package-name"
                    id="package-name"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., lodash"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                  Version (optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="version"
                    id="version"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., 4.17.21"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate README
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This service is currently in development. See the{' '}
            <a href="https://github.com/bhouston/agentic-readme" className="text-indigo-600 hover:text-indigo-500">
              GitHub repository
            </a>{' '}
            for more information.
          </p>
        </div>
      </div>
    </div>
  );
}