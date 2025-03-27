import React from 'react';
import { StorageInfo } from '@/services/packageAnalyzer/types';

interface ReadmeDisplayProps {
  content: string;
  packageName: string;
  version?: string;
  contentHash?: string;
}

/**
 * Component to display README content
 * 
 * @param content - README content in Markdown format
 * @param packageName - Package name
 * @param version - Package version (optional)
 * @param contentHash - Content hash for CAS (optional)
 */
const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({
  content,
  packageName,
  version,
  contentHash,
}) => {
  // Check if content is a stringified StorageInfo object
  let markdownContent = content;
  let storageInfo: StorageInfo | null = null;
  
  try {
    const parsed = JSON.parse(content);
    if (parsed.contentHash && parsed.bucket && parsed.path && parsed.filename) {
      storageInfo = parsed as StorageInfo;
      // In a real implementation, we would fetch the content from storage
      // For now, we'll just display a placeholder
      markdownContent = `# ${packageName}${version ? ` v${version}` : ''}

This README is stored in content-addressable storage.

**Content Hash:** ${parsed.contentHash}
**Storage Location:** ${parsed.bucket}/${parsed.path}/${parsed.filename}

*Content will be rendered here in the actual implementation.*`;
    }
  } catch (e) {
    // Not a JSON string, use as-is
  }

  return (
    <div className="readme-container">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">
            {packageName}
            {version && <span className="ml-2 text-gray-500">v{version}</span>}
          </h2>
          {contentHash && (
            <div className="mt-1 text-xs text-gray-500">
              Content Hash: {contentHash}
            </div>
          )}
          {storageInfo && (
            <div className="mt-1 text-xs text-gray-500">
              Stored in CAS: {storageInfo.bucket}/{storageInfo.path}/{storageInfo.filename}
            </div>
          )}
        </div>
        <div className="px-6 py-4 prose max-w-none">
          {/* 
            In a real implementation, this would use a markdown renderer like react-markdown
            For now, we'll use a simple pre tag with whitespace wrapping
          */}
          <pre className="whitespace-pre-wrap">{markdownContent}</pre>
        </div>
      </div>
    </div>
  );
};

export default ReadmeDisplay;