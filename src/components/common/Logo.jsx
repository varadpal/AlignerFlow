import './Logo.css';

/**
 * AlignerFlow brand mark — implemented from the Claude Design handoff.
 * Symbol: PlayStation-Blue stopwatch arc wrapping a black aligner-tray curve.
 * The tray uses --text-primary so it flips to white on the dark canvas; the
 * ring stays brand blue. Pass `wordmark` for the full lockup.
 *
 * @param {number} size      Symbol edge length in px (default 40)
 * @param {boolean} wordmark Render the "AlignerFlow" wordmark beside/under the symbol
 * @param {'row'|'column'} layout  Lockup direction (default 'row')
 */
export default function Logo({ size = 40, wordmark = false, layout = 'row', className = '' }) {
  const gap = Math.round(size * 0.28);
  const fontSize = Math.round(size * 0.5);

  return (
    <span
      className={`logo logo--${layout} ${className}`.trim()}
      style={{ gap: `${gap}px` }}
      role="img"
      aria-label="AlignerFlow"
    >
      <svg
        className="logo__symbol"
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Progress ring: stopwatch arc with one rounded open gap at top */}
        <path
          d="M 256 76 A 180 180 0 1 1 144.7 117.6"
          stroke="#0070d1"
          strokeWidth="40"
          strokeLinecap="round"
          fill="none"
        />
        {/* Aligner tray: scalloped row of rounded tooth bumps */}
        <path
          d="M 154 262 q 0 -26 25 -26 q 25 0 25 26 q 0 -26 26 -26 q 26 0 26 26 q 0 -26 25 -26 q 25 0 25 26 q 0 -26 25 -26 q 25 0 25 26"
          stroke="var(--text-primary)"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {wordmark && (
        <span className="logo__wordmark" style={{ fontSize: `${fontSize}px` }}>
          <span className="logo__word-light">Aligner</span><span className="logo__word-bold">Flow</span>
        </span>
      )}
    </span>
  );
}
