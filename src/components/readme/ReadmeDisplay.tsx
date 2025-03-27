import React from 'react';

interface ReadmeDisplayProps {
  content: string;
  packageName: string;
  version?: string;
}

const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({
  content,
  packageName,
  version,
}) => {
  return (
    <div className="readme-container">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">
            {packageName}
            {version && <span className="ml-2 text-gray-500">v{version}</span>}
          </h2>
        </div>
        <div className="px-6 py-4 prose max-w-none">
          {/* In a real implementation, this would use a markdown renderer */}
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default ReadmeDisplay;