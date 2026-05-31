import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaLock, FaUserShield, FaEnvelope } from "react-icons/fa";
import { login as loginRequest } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    console.log("[LOADING STATE] LoginPage loading: true");
    setLoading(true);
    try {
      const res = await loginRequest({ email, password });
      login(res.data);
      toast.success("Signed in successfully");
      const destination = res.data.user.role === "admin"
        ? "/admin"
        : res.data.user.role === "chef"
          ? "/chef"
          : res.data.user.role === "waiter"
            ? "/waiter"
            : "/scan";
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      console.log("[LOADING STATE] LoginPage loading: false");
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-colors duration-200 font-semibold text-sm";

  return (
    <section className="grid min-h-screen place-items-center bg-[#FAF9F6] px-5 py-10 text-neutral-800 font-sans">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-neutral-200/60 bg-white p-8 shadow-sm space-y-6">
        
        {/* Brand Header & Logo Section */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-neutral-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-2xl text-white shadow-md mb-3">
            <FaUserShield />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-red-600 flex items-center gap-1">
            Aurum Bistro
          </span>
          <h1 className="mt-1 text-2xl font-black text-neutral-800 tracking-tight leading-none">
            Admin & Staff Login
          </h1>
          <p className="mt-2 text-xs text-neutral-400 font-semibold max-w-[280px] leading-normal">
            Secure JWT access for Admin, Chef, and Waiter dashboards.
          </p>
        </div>
        
        {/* Helper Box: Demo Credentials */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-150 text-xs font-semibold text-neutral-500 leading-normal space-y-2">
          <span className="font-black text-neutral-800 uppercase tracking-wider text-[10px]">Demo Accounts Info</span>
          <div className="font-mono text-[10px] text-neutral-600 space-y-1">
            <div className="flex items-center gap-1.5 pl-1">
              <span>Admin:</span>
              <span className="text-red-600 font-bold ml-1">admin@restaurant.com</span>
              <span className="text-neutral-400">/ admin123</span>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <span>Chef:</span>
              <span className="text-red-600 font-bold ml-1">chef@restaurant.com</span>
              <span className="text-neutral-400">/ chef123</span>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <span>Waiter:</span>
              <span className="text-red-600 font-bold ml-1">waiter@restaurant.com</span>
              <span className="text-neutral-400">/ waiter123</span>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Email Address</span>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
              <input 
                className={inputClass} 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                autoComplete="email" 
                placeholder="name@company.com" 
                required 
              />
            </div>
          </label>
          
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Password</span>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
              <input 
                className={inputClass} 
                value={password} 
                onChange={(event) => setPassword(event.target.value)} 
                type="password" 
                autoComplete="current-password" 
                placeholder="Your password" 
                required 
              />
            </div>
          </label>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full py-3.5 text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition active:scale-95 duration-150" 
          loading={loading}
        >
          Sign In
        </Button>
      </form>
    </section>
  );
}
