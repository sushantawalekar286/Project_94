import { useState, useEffect } from "react";
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
  const { login, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      const destination = user.role === "admin"
        ? "/admin"
        : user.role === "chef"
          ? "/chef"
          : user.role === "waiter"
            ? "/waiter"
            : "/scan";
      navigate(destination, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    
    // Trim spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Check empty email
    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return;
    }

    // Email validation regex (standard format user@example.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Check empty password
    if (!trimmedPassword) {
      toast.error("Please enter your password.");
      return;
    }

    console.log("[LOADING STATE] LoginPage loading: true");
    setLoading(true);
    try {
      const res = await loginRequest({ email: trimmedEmail, password: trimmedPassword });
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
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        toast.error(error.response.data.errors[0]);
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
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
        <div className="flex flex-col items-center text-center pb-5 border-b border-neutral-100">
          <img src="/logo.png" alt="94 Cafe & Chinese Logo" className="h-28 w-28 rounded-[24px] object-cover shadow-lg mb-4 border border-neutral-100" />
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight leading-tight">
            94 Cafe & Chinese
          </h1>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-red-600 mt-2 block">
            Staff Portal Access
          </span>
          <p className="mt-2 text-xs text-neutral-450 font-semibold max-w-[280px] leading-normal">
            Secure JWT access for Admin, Chef, and Waiter dashboards.
          </p>
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
                placeholder="staff@94cafechinese.com" 
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
