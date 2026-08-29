import { FiFacebook, FiInstagram, FiYoutube } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";
import Logo from "./Logo.jsx";
import Navbar from "./Navbar.jsx";

const SHOP = [
  ["All Categories", "/products"],
  ["Offers", "/products"],
  ["My Cart", "/cart"],
  ["My Orders", "/orders"],
];

const SERVICE = [
  "About Us",
  "Contact Us",
  "FAQs",
  "Shipping & Delivery",
  "Returns & Refunds",
];

const ACCOUNT = [
  ["Login / Sign Up", "/login"],
  ["My Profile", "/profile"],
  ["My Addresses", "/addresses"],
];

const Layout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-clip">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>

      <footer className="max-w-7xl w-full mx-auto px-6 pt-11">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr_1.15fr]">
          <div>
            <div className="mb-3.5">
              <Logo size={34} />
            </div>
            <p className="text-[12.5px] leading-[1.85] text-ink-600 max-w-[230px]">
              Your trusted grocery partner. Quality products, fast delivery,
              every time.
            </p>
          </div>

          <div>
            <div className="text-[13.5px] font-semibold mb-3.5">Shop</div>
            <ul className="flex flex-col gap-2.5 text-[12.5px] text-ink-600">
              {SHOP.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-primary-600">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[13.5px] font-semibold mb-3.5">
              Customer Service
            </div>
            <ul className="flex flex-col gap-2.5 text-[12.5px] text-ink-600">
              {SERVICE.map((label) => (
                <li key={label} className="cursor-pointer hover:text-primary-600">
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[13.5px] font-semibold mb-3.5">My Account</div>
            <ul className="flex flex-col gap-2.5 text-[12.5px] text-ink-600">
              {ACCOUNT.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-primary-600">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="text-[13.5px] font-semibold mt-5 mb-3">
              Get Our App
            </div>
            <div className="flex gap-2.5">
              <div className="bg-primary-800 text-white rounded-md px-3 py-[7px]">
                <div className="text-[7px] tracking-[.6px] opacity-70">
                  GET IT ON
                </div>
                <div className="text-[11px] font-semibold">Google Play</div>
              </div>
              <div className="bg-primary-800 text-white rounded-md px-3 py-[7px]">
                <div className="text-[7px] tracking-[.6px] opacity-70">
                  Download on the
                </div>
                <div className="text-[11px] font-semibold">App Store</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-line mt-8 py-4.5 flex items-center justify-between gap-4 flex-wrap text-[11.5px] text-ink-500">
          <div>&copy; {new Date().getFullYear()} Nature’s Cart. All Rights Reserved.</div>
          <div className="flex gap-5.5">
            <span className="cursor-pointer hover:text-primary-600">
              Privacy Policy
            </span>
            <span className="cursor-pointer hover:text-primary-600">
              Terms &amp; Conditions
            </span>
          </div>
          <div className="flex gap-3 text-ink-500">
            <FiFacebook size={15} className="cursor-pointer hover:text-primary-600" />
            <FiInstagram size={15} className="cursor-pointer hover:text-primary-600" />
            <FiYoutube size={15} className="cursor-pointer hover:text-primary-600" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
