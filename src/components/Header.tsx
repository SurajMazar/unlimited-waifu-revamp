export function Header() {
  return (
    <header className="relative z-10 flex flex-col items-center gap-2 pt-10 pb-4 text-center px-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl animate-bob">🌸</span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-sakura-600 drop-shadow-sm">
          unlimited:waifu2x
        </h1>
        <span className="text-4xl animate-bob" style={{ animationDelay: '0.4s' }}>
          🌸
        </span>
      </div>
      <p className="text-sm sm:text-base text-lavender-400 font-medium">
        AI upscaling &amp; denoising for your favorite art, right in your browser~
      </p>
    </header>
  );
}
