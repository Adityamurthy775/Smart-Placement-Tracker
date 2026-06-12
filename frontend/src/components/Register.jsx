import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router'
import { UserContext } from '../contexts/UserContext'
import { GoogleLogin } from '@react-oauth/google'

function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { registerUser, googleLoginUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  
  // Watch role to ensure it is selected before Google Signup
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setErrorMsg('');
    const result = await registerUser(data);
    if (result.success) {
      navigate('/main-page');
    } else {
      setErrorMsg(result.error);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    if (!selectedRole) {
      setErrorMsg('Please select a role before signing up with Google.');
      return;
    }
    
    const result = await googleLoginUser(credentialResponse.credential, selectedRole);
    if (result.success) {
      navigate('/main-page');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md z-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-2">
            <h2 className="text-3xl font-bold text-white tracking-tight text-center">
              Create Account
            </h2>
            <p className="text-gray-400 mt-2 text-sm text-center">Join Smart Placement Tracker today</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-[#1a1a1a]/80 border border-white/5 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-red-400 text-xs mt-2 ml-1">{errors.name.message}</p>}
            </div>

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

            {/* Roll Number / Id */}
            <div>
              <input
                type="text"
                placeholder="ID / Roll Number"
                className="w-full bg-[#1a1a1a]/80 border border-white/5 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                {...register('Id', { required: 'ID is required' })}
              />
              {errors.Id && <p className="text-red-400 text-xs mt-2 ml-1">{errors.Id.message}</p>}
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

          {/* Role Selection */}
          <div className="mt-2 bg-[#1a1a1a]/50 p-4 rounded-2xl border border-white/5">
            <p className="text-white/80 font-medium mb-3 text-sm">Select Your Role</p>
            <div className="flex gap-4 sm:gap-6 text-white text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  value="Student"
                  className="accent-white cursor-pointer w-4 h-4"
                  {...register('role', { required: 'Please select a role' })}
                />
                <span className="group-hover:text-gray-300 transition">Student</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  value="Teacher"
                  className="accent-white cursor-pointer w-4 h-4"
                  {...register('role')}
                />
                <span className="group-hover:text-gray-300 transition">Teacher</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  value="HR"
                  className="accent-white cursor-pointer w-4 h-4"
                  {...register('role')}
                />
                <span className="group-hover:text-gray-300 transition">HR</span>
              </label>
            </div>
            {errors.role && <p className="text-red-400 text-xs mt-2">{errors.role.message}</p>}
          </div>

          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400 text-sm">Already have an account?</span>
            <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium transition">Sign In</Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 bg-white text-black font-semibold py-4 rounded-2xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-white/10"
          >
            Create Account
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">or sign up with</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Google OAuth */}
          <div className="flex justify-center w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center overflow-hidden rounded-2xl">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Google Sign-Up failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="signup_with"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
