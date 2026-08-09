export function Footer() {
  return (
    <footer className="relative z-10 mt-10 pb-8 text-center text-xs text-mist-500">
      <p>
        Powered by{' '}
        <a className="text-mist-300 underline hover:text-neon-cyan-soft" href="https://github.com/nagadomi/nunif" target="_blank" rel="noreferrer">
          nunif/waifu2x
        </a>{' '}
        · rebuilt in React ⚡
      </p>
    </footer>
  );
}
