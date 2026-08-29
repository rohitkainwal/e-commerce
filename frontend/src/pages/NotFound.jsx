import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="font-display text-7xl font-extrabold text-primary-100 mb-2">
        404
      </h1>
      <p className="font-display text-xl font-bold mb-1">Page not found</p>
      <p className="text-ink-500 mb-6">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-500 inline-block"
      >
        Go Home
      </Link>
    </div>
  );
}
