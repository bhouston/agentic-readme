export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Agentic README Service</h1>
      <p className="text-xl mb-8">
        Automatically generate high-quality, AI-friendly README files for npm libraries.
      </p>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Generate a README</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="packageName" className="block text-sm font-medium mb-1">
              Package Name
            </label>
            <input
              type="text"
              id="packageName"
              className="w-full px-4 py-2 border rounded-md"
              placeholder="e.g., react, lodash, express"
            />
          </div>
          <div>
            <label htmlFor="version" className="block text-sm font-medium mb-1">
              Version (optional)
            </label>
            <input
              type="text"
              id="version"
              className="w-full px-4 py-2 border rounded-md"
              placeholder="e.g., 18.2.0, latest"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generate README
          </button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Enter an npm package name</li>
            <li>Our service analyzes the package code and existing documentation</li>
            <li>An AI-friendly README is generated following best practices</li>
            <li>Documentation is verified through sandbox testing</li>
          </ol>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Comprehensive documentation generation</li>
            <li>Sandbox verification of functionality</li>
            <li>Version-specific documentation</li>
            <li>Model Context Protocol support for AI agents</li>
          </ul>
        </div>
      </div>
    </div>
  );
}