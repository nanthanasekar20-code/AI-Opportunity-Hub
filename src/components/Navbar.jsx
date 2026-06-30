function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-mist/80 backdrop-blur-md border-b border-mist">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-display font-bold text-xl text-ink">
          AI Opportunitygit status Hub
        </span>

        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-midnight hover:text-ink transition-colors px-4 py-2">
            Log in
          </button>
          <button className="bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-cocoa transition-colors">
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;