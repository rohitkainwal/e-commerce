import { Link } from "react-router-dom";
import { LogoMark } from "./Logo.jsx";

//? all the auth pages (login/signup/forgot/reset) share this same green box
const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-card">
          <div className="bg-cream-100 border-b border-line px-7 py-6 text-center">
            <Link to="/" className="inline-block mb-3">
              <LogoMark size={44} />
            </Link>
            <h2 className="font-display text-2xl font-extrabold text-ink-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-ink-600 text-sm mt-1">{subtitle}</p>
            )}
          </div>

          <div className="p-7">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
