import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl mb-4">🔍</p>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404 — Page Not Found</h1>
        <p className="text-gray-500 mb-8">Looks like this page doesn't exist.</p>
        <Link to="/" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
