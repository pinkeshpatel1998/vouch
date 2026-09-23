import Link from "next/link";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Vouch home"
      className={`brand ${light ? "brand-light" : ""}`}
    >
      <span className="brand-mark" aria-hidden="true">
        v<span>✳</span>
      </span>
      <span>
        vouch<span className="brand-period">.</span>
      </span>
    </Link>
  );
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"} />
    </svg>
  );
}
