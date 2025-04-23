import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <title>404 Not Found</title>
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-6xl font-bold text-red-500">404</h1>
          <p className="text-2xl font-semibold text-gray-700">Not Found</p>
          <p className="text-gray-600">
            Oops! It looks like the page you were looking for could not be
            found.
          </p>
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
          >
            Go Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}