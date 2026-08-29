import { Link } from "react-router-dom";

/*
  Nature’s Cart logo, taken from the design --> a shopping cart outline
  with a small leaf sitting on top of it.
*/

export const LogoMark = ({ size = 34 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Nature's Cart logo"
    >
      <path
        d="M6 13h4l4 13h15l4-10H13"
        stroke="var(--color-primary-600)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="31" r="2.4" fill="var(--color-primary-600)" />
      <circle cx="28" cy="31" r="2.4" fill="var(--color-primary-600)" />
      {/* the leaf */}
      <path d="M25 12c0-4 3-7 7-7 0 4-3 7-7 7z" fill="var(--color-primary-300)" />
    </svg>
  );
};

const Logo = ({ size = 34, withText = true }) => {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <LogoMark size={size} />

      {withText && (
        <div>
          <div className="text-[19px] font-bold tracking-[-0.3px] leading-none">
            <span className="text-ink-900">Nature’s</span>{" "}
            <span className="text-primary-600">Cart</span>
          </div>
          <div className="text-[7.5px] tracking-[1.4px] text-ink-500 mt-[3px]">
            FRESH. NATURAL. DELIVERED.
          </div>
        </div>
      )}
    </Link>
  );
};

export default Logo;
