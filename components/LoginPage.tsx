import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import { auth } from "../utils/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword
} from "firebase/auth";
import { db } from "../utils/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Check } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const interestOptions = ["Food", "Travel", "Health", "Work", "Other"];

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // If new user, we might want to collect extra info later, 
        // but for now just create a basic profile
        const [fName, ...lNameParts] = (user.displayName || "User").split(" ");
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email || "",
          firstName: fName || "",
          lastName: lNameParts.join(" ") || "",
          createdAt: Date.now(),
          interests: [],
        });
      }
      onLoginSuccess(user.email || "User");
    } catch (error: any) {
      console.error("Google Auth error:", error);
      alert("Google Sign-In failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save extra details to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email || "",
          firstName,
          lastName,
          age: parseInt(age) || 0,
          interests: selectedInterests,
          createdAt: Date.now()
        });
        
        onLoginSuccess(user.email || "User");
      } else {
        // Login Logic
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess(email);
      }
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
        className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative z-10 p-8 border border-white"
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
            <div id="recaptcha-container"></div>
            
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
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
              />
            </div>

            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                    />
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    required
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
                  />
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-700 ml-1">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedInterests(prev => 
                            prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]
                          );
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-1 ${
                          selectedInterests.includes(opt)
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                        }`}
                      >
                        {selectedInterests.includes(opt) && <Check size={14} />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

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
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900"
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
              disabled={isLoading || (mode === "forgot-password" ? !email : (!email || !password))}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:bg-slate-400 disabled:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2 mt-2"
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

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-4 text-slate-400 font-black tracking-widest">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <GoogleIcon />
              Continue with Google
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
