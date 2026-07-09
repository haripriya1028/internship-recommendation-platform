import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", formData);
      
      console.log("LOGIN RESPONSE:", response.data);
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data._id);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("role", response.data.role);

      alert("Login Successful!");
      if (response.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.log(error.response?.data);
      alert("Invalid Email or Password");
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#eef4ff_45%,_#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)]">
          {/* Left side branding */}
          <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(37,99,235,0.18),_transparent_18%)]" />
            <div className="absolute -left-10 top-14 h-24 w-24 rounded-full bg-blue-400/15 blur-2xl" />
            <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/10">
                  <span className="text-lg font-semibold">I</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-blue-100">Platform</p>
                  <h2 className="text-2xl font-semibold">InternFlow</h2>
                </div>
              </div>

              <div className="mt-16 max-w-md">
                <p className="text-sm font-medium text-blue-100">Discover your next big opportunity</p>
                <h3 className="mt-3 text-4xl font-semibold leading-tight">
                  Build your career with curated internships.
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-200/90">
                  Connect with top companies, track applications, and get matched with roles that fit your goals.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5L10 17.5L19 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Verified opportunities</p>
                  <p className="text-xs text-slate-300">1000+ startup partners</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Fast application flow</p>
                  <p className="text-xs text-slate-300">Save time on every step</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side login card */}
          <div className="flex w-full items-center justify-center bg-slate-50/70 p-6 sm:p-8 md:w-1/2 md:p-10">
            <div className="w-full max-w-md animate-[fadeIn_0.5s_ease-out] rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 transition duration-300 hover:shadow-2xl hover:shadow-slate-200/70 sm:p-10">
              <div className="text-center">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
                  Welcome back
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Sign in</h1>
                <p className="mt-2 text-sm text-slate-500">Access your dashboard and continue your journey</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6.5H20C20.55 6.5 21 6.95 21 7.5V17C21 17.55 20.55 18 20 18H4C3.45 18 3 17.55 3 17V7.5C3 6.95 3.45 6.5 4 6.5Z" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M4 8L12 13L20 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="username"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <a href="#" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none">
                      <path d="M7 11V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M12 15.5V17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 active:translate-y-0"
                >
                  Sign in
                </button>
              </form>

              

              

              <p className="mt-6 text-center text-sm text-slate-500">
                New to InternFlow?{" "}
                <Link to="/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;