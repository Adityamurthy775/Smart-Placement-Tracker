import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router'
import { UserContext } from '../contexts/UserContext'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google';
import { authInput } from '../../Styles/common';
import { API_BASE } from '../lib/utils';

// Must stay in step with demo-accounts.md / backend/seed-demo.js.
const DEMO_PASSWORD = 'Demo@12345';
const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'student@example.com' },
  { role: 'Teacher', email: 'teacher@example.com' },
  { role: 'HR', email: 'hr@example.com' },
  { role: 'Admin', email: 'admin@example.com' },
];

function ForgotPasswordModal({ onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onEmailSubmit = async (data) => {
    setEmail(data.email);
    try {
      await axios.post(`${API_BASE}/user-api/forgot-password`, { email: data.email });
      setStep('reset');
      setMessage('');
    } catch {
      // For demo, proceed anyway
      setStep('reset');
      setMessage('');
    }
  };

  const onResetSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    try {
      await axios.post(`${API_BASE}/user-api/reset-password`, { 
        email, 
        newPassword: data.newPassword 
      });
      setMessage('Password reset successfully! You can now login.');
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-secondary rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Forgot Password</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground text-2xl font-bold transition">&times;</button>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSubmit(onEmailSubmit)} className="flex flex-col gap-5">
            <p className="text-muted-foreground text-sm">Enter your registered email to reset your password.</p>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className={authInput}
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-destructive text-xs mt-2 ml-1">{errors.email.message}</p>}
            </div>
            <button type="submit" className="bg-accent text-accent-foreground font-semibold py-4 rounded-2xl hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onResetSubmit)} className="flex flex-col gap-5">
            <p className="text-muted-foreground text-sm">Enter your new password for <span className="text-foreground font-semibold">{email}</span></p>
            <div>
              <input
                type="password"
                placeholder="New Password"
                className={authInput}
                {...register('newPassword', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              {errors.newPassword && <p className="text-destructive text-xs mt-2 ml-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className={authInput}
                {...register('confirmPassword', { required: 'Confirm your password' })}
              />
              {errors.confirmPassword && <p className="text-destructive text-xs mt-2 ml-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" className="bg-white text-black font-semibold py-4 rounded-2xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Reset Password
            </button>
          </form>
        )}

        {/* Success reads as Text, not green: the ramp has no green, and
            `text-green-400` measured 1.5:1 on the light card. The wording
            already carries the outcome. */}
        {message && <p className={`text-sm mt-5 text-center ${message.includes('success') ? 'text-foreground' : 'text-destructive'}`}>{message}</p>}
      </div>
    </div>
  );
}

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { loginUser, googleLoginUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [demoBusy, setDemoBusy] = useState('');

  // The four accounts `npm run seed:demo` writes (see demo-accounts.md). One
  // click signs in as that role — no typing, no password to copy.
  const demoLogin = async (email) => {
    setErrorMsg('');
    setDemoBusy(email);
    const result = await loginUser({ email, password: DEMO_PASSWORD });
    setDemoBusy('');
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(`${result.error} — run \`npm run seed:demo\` in backend/ to create the demo accounts.`);
    }
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    const result = await loginUser(data);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    const result = await googleLoginUser(credentialResponse.credential);
    if (result.success) {
      navigate('/dashboard');
    } else {
      if (result.requiresSignup) {
        setErrorMsg('User not found. Please sign up first.');
      } else {
        setErrorMsg(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="w-full max-w-md z-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-secondary rounded-3xl p-8 sm:p-10 flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-4">

            <h2 className="text-3xl font-bold text-foreground tracking-tight text-center">
              Welcome Back
            </h2>
            <p className="text-muted-foreground mt-2 text-sm text-center">Sign in to Smart Placement Tracker</p>
          </div>

          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className={authInput}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' }
                })}
              />
              {errors.email && <p className="text-destructive text-xs mt-2 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                className={authInput}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
              {errors.password && <p className="text-destructive text-xs mt-2 ml-1">{errors.password.message}</p>}
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-between items-center mt-1">
            <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition">Create account</Link>
            <button 
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-foreground/80 text-sm hover:text-foreground transition font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 bg-accent text-accent-foreground font-semibold py-4 rounded-2xl hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Sign In
          </button>

          {/* Demo login — one click per role */}
          <div className="mt-2 rounded-2xl border border-secondary/60 bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                demo login
              </span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              One click signs you in as a seeded role. No password needed.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DEMO_ACCOUNTS.map(({ role, email }) => (
                <button
                  key={role}
                  type="button"
                  disabled={Boolean(demoBusy)}
                  onClick={() => demoLogin(email)}
                  className="rounded-xl border border-secondary bg-card px-3 py-2.5 text-sm font-semibold text-foreground transition hover:border-accent hover:bg-accent/15 disabled:opacity-60"
                >
                  {demoBusy === email ? 'Signing in…' : `Demo ${role}`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Google OAuth */}
          <div className="flex justify-center w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center overflow-hidden rounded-2xl">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google Sign-In failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="signin_with"
            />
          </div>
        </form>
      </div>

      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </div>
  )
}

export default Login
