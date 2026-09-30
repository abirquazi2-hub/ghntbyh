export function HeroFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      <div className="relative h-[70%] max-h-[520px] aspect-square animate-[float_7s_ease-in-out_infinite]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,#e8ecf3,#8a93a3_40%,#2a2f3a_75%)] shadow-[0_40px_120px_-20px_rgba(0,0,0,.9),inset_0_0_60px_rgba(255,255,255,.15)]" />
        <div className="absolute inset-[9%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#1b202a,#05070b_70%)] ring-1 ring-white/10" />
        <div className="absolute inset-[9%] rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(243,201,139,.35),transparent_30%,rgba(120,150,255,.25),transparent_70%)] animate-[spin_24s_linear_infinite]" />
      </div>
    </div>
  );
}

