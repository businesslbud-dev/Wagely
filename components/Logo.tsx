/**
 * Wagely mark.
 *
 * A shield (the wage is held and protected) containing a single unbroken stroke
 * that draws a W and then keeps climbing past it — so the same stroke reads as
 * the letter, as a tick, and as a wage that finally goes up.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="wagely-shield" x1="8" y1="2" x2="33" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FA9B3E" />
          <stop offset="1" stopColor="#E06A12" />
        </linearGradient>
      </defs>

      <path
        d="M20 2.6 L33.4 6.9 V20.4 C33.4 28.9 27.9 35 20 37.8 C12.1 35 6.6 28.9 6.6 20.4 V6.9 Z"
        fill="url(#wagely-shield)"
        stroke="url(#wagely-shield)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      <path
        d="M11.8 16.2 L16.2 26.4 L20 19.4 L23.5 26.1 L30.4 11.6"
        stroke="#fff"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word">Wagely</span>
    </span>
  );
}
