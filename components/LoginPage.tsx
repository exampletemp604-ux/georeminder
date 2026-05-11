import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { auth } from "../utils/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBack,
}) => {
  type AuthMode = "login" | "signup" | "forgot-password";
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "forgot-password") {
        if (!email.trim()) {
          alert("Please enter your email.");
          return;
        }
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
        return;
      }

      if (!email.trim() || !password.trim()) {
        alert("Please enter both email and password.");
        return;
      }

      if (mode === "signup") {
        if (password.length < 6) {
          alert("Password must be at least 6 characters for security.");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      onLoginSuccess(email);
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "Something went wrong. Please try again.";
      
      // Map Firebase error codes to user-friendly messages
      const errorMap: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid email or password. Please check your credentials.",
        "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
        "auth/operation-not-allowed": "Email/Password sign-in is not enabled in Firebase Console.",
      };

      if (error.code && errorMap[error.code]) {
        message = errorMap[error.code];
      } else if (error.message) {
        // Fallback to the raw Firebase error message if it's an unknown code
        message = error.message;
      }
      
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === "login") return "Welcome Back";
    if (mode === "signup") return "Create Account";
    return "Reset Password";
  };

  const getSubtitle = () => {
    if (mode === "login") return "Sign in to access your geo-reminders";
    if (mode === "signup") return "Start mapping your memories today";
    return "We'll send you a link to reset your password";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-[Inter] overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />
      </div>

      <button
        onClick={onBack}
        className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 transition flex gap-2 items-center z-20 group font-medium"
      >
        <ArrowRight
          className="rotate-180 transition-transform group-hover:-translate-x-1"
          size={18}
        />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 border border-white"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[1.2rem] mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-200"
          >
            {mode === "login" ? (
              <LogIn className="text-white" size={28} />
            ) : mode === "signup" ? (
              <UserPlus className="text-white" size={28} />
            ) : (
              <Mail className="text-white" size={28} />
            )}
          </motion.div>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {getTitle()}
          </h2>
          <p className="text-slate-500 font-medium">
            {getSubtitle()}
          </p>
        </div>

        {resetSent ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 font-medium">
              Check your email! We've sent a password reset link to <span className="font-bold">{email}</span>.
            </div>
            <button
              onClick={() => {
                setResetSent(false);
                setMode("login");
              }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-1"
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                size={20}
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
              />
            </div>

            {mode !== "forgot-password" && (
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}

            <AnimatePresence>
              {mode === "login" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-right pb-2"
                >
                  <button
                    type="button"
                    onClick={() => setMode("forgot-password")}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || !email || (mode !== "forgot-password" && !password)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block"
                />
              ) : mode === "forgot-password" ? (
                "Send Reset Link"
              ) : (
                "Continue to Dashboard"
              )}
            </button>
          </form>
        )}

        {mode !== "forgot-password" && (
          <p className="mt-8 text-center text-sm font-medium text-slate-600">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-indigo-600 hover:text-indigo-700 font-bold"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        )}

        {mode === "forgot-password" && !resetSent && (
          <p className="mt-8 text-center text-sm font-medium text-slate-600">
            Wait, I remember it!{" "}
            <button
              onClick={() => setMode("login")}
              className="text-indigo-600 hover:text-indigo-700 font-bold"
            >
              Back to Login
            </button>
          </p>
        )}

        <p className="mt-4 text-center text-xs font-medium text-slate-400">
          {mode === "forgot-password" 
            ? "We'll simulate sending a reset email" 
            : "Use any email & password to get started"}
        </p>
      </motion.div>
    </div>
  );
};
