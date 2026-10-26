import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const navItems = [
    { to: "/profile", label: "Profile" },
    { to: "/recommendations", label: "Recommendations" },
    { to: "/browse-internships", label: "Browse Internships" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/profile" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-sm shadow-blue-500/20">
            I
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Platform</p>
            <h1 className="text-sm font-semibold text-slate-900">InternFlow</h1>
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-xl px-2 py-2 text-sm font-medium transition duration-200 sm:px-3 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={logout}
            className="ml-1 inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 sm:px-4"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;