import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router'
import { UserContext } from '../contexts/UserContext'
import axios from 'axios'
import { GoogleLogin } from '@react-oauth/google';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

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
    } catch (err) {
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111]/90 border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold transition">&times;</button>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSubmit(onEmailSubmit)} className="flex flex-col gap-5">
            <p className="text-gray-400 text-sm">Enter your registered email to reset your password.</p>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-[#1a1a1a] border border-white/5 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-2 ml-1">{errors.email.message}</p>}
            </div>
            <button type="submit" className="bg-white text-black font-semibold py-4 rounded-2xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onResetSubmit)} className="flex flex-col gap-5">
            <p className="text-gray-400 text-sm">Enter your new password for <span className="text-white font-semibold">{email}</span></p>
            <div>
              <input
                type="password"
                placeholder="New Password"
                className="w-full bg-[#1a1a1a] border border-white/5 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                {...register('newPassword', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              {errors.newPassword && <p className="text-red-400 text-xs mt-2 ml-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full bg-[#1a1a1a] border border-white/5 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                {...register('confirmPassword', { required: 'Confirm your password' })}
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-2 ml-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" className="bg-white text-black font-semibold py-4 rounded-2xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Reset Password
            </button>
          </form>
        )}

        {message && <p className={`text-sm mt-5 text-center ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
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

  const onSubmit = async (data) => {
    setErrorMsg('');
    const result = await loginUser(data);
    if (result.success) {
      navigate('/main-page');
    } else {
      setErrorMsg(result.error);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    const result = await googleLoginUser(credentialResponse.credential);
    if (result.success) {
      navigate('/main-page');
    } else {
      if (result.requiresSignup) {
        setErrorMsg('User not found. Please sign up first.');
      } else {
        setErrorMsg(result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md z-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-4">

            <h2 className="text-3xl font-bold text-white tracking-tight text-center">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2 text-sm text-center">Sign in to Smart Placement Tracker</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-[#1a1a1a]/80 border border-white/5 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' }
                })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-2 ml-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-[#1a1a1a]/80 border border-white/5 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
              {errors.password && <p className="text-red-400 text-xs mt-2 ml-1">{errors.password.message}</p>}
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-between items-center mt-1">
            <Link to="/register" className="text-sm text-gray-400 hover:text-white transition">Create account</Link>
            <button 
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-white/70 text-sm hover:text-white transition font-medium"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 bg-white text-black font-semibold py-4 rounded-2xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-white/10"
          >
            Sign In
          </button>
          
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-white/10"></div>
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
