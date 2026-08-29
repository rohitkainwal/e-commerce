import {
  FiBox,
  FiGrid,
  FiMapPin,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/admin", label: "Dashboard", icon: <FiGrid size={15} />, end: true },
  { to: "/admin/products", label: "Products", icon: <FiBox size={15} /> },
  { to: "/admin/orders", label: "Orders", icon: <FiShoppingBag size={15} /> },
  { to: "/admin/users", label: "Users", icon: <FiUsers size={15} /> },
  { to: "/admin/areas", label: "Delivery Areas", icon: <FiMapPin size={15} /> },
];

//? the tabs stay on every admin page, Outlet is the page itself
const AdminLayout = () => {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Admin Panel
        </h1>
        <p className="text-sm text-ink-500">
          Manage products, orders and customers.
        </p>
      </div>

      <div className="flex gap-1 border-b border-line mb-5 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition ${
                isActive
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-ink-600 hover:text-ink-900"
              }`
            }
          >
            {t.icon} {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

export default AdminLayout;
