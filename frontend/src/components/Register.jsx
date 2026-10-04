import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router'
import { UserContext } from '../contexts/UserContext'
import { GoogleLogin } from '@react-oauth/google'
import { authInput } from '../../Styles/common'

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
      navigate('/dashboard');
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
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background text-foreground">
      <div className="w-full max-w-md z-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card border border-secondary rounded-3xl p-8 sm:p-10 flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-2">
            <h2 className="text-3xl font-bold text-foreground tracking-tight text-center">
              Create Account
            </h2>
            <p className="text-muted-foreground mt-2 text-sm text-center">Join Smart Placement Tracker today</p>
          </div>

          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className={authInput}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-destructive text-xs mt-2 ml-1">{errors.name.message}</p>}
            </div>

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

            {/* Roll Number / Id */}
            <div>
              <input
                type="text"
                placeholder="ID / Roll Number"
                className={authInput}
                {...register('Id', { required: 'ID is required' })}
              />
              {errors.Id && <p className="text-destructive text-xs mt-2 ml-1">{errors.Id.message}</p>}
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

          {/* Role Selection */}
          <div className="mt-2 bg-muted p-4 rounded-2xl border border-border">
            <p className="text-foreground font-medium mb-3 text-sm">Select Your Role</p>
            <div className="flex flex-wrap gap-2 text-foreground text-sm">
              <label className="cursor-pointer group">
                <input
                  type="radio"
                  value="Student"
                  className="peer sr-only"
                  {...register('role', { required: 'Please select a role' })}
                />
                {/* Role chip: Card surface with a Secondary border when idle, Accent
                    field when selected — Text on Accent is 12.0:1, whereas the old
                    blue-900/blue-200 pair sat off-palette at 5.1:1 on near-black. */}
                <span className="inline-flex items-center justify-center rounded-lg border border-secondary bg-card text-foreground px-3 py-2 transition hover:border-primary hover:bg-secondary/30 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-foreground">
                  Student
                </span>
              </label>

              <label className="cursor-pointer group">
                <input
                  type="radio"
                  value="HR"
                  className="peer sr-only"
                  {...register('role')}
                />
                <span className="inline-flex items-center justify-center rounded-lg border border-secondary bg-card text-foreground px-3 py-2 transition hover:border-primary hover:bg-secondary/30 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-foreground">
                  HR
                </span>
              </label>
            </div>
            {errors.role && <p className="text-destructive text-xs mt-2">{errors.role.message}</p>}
          </div>

          <div className="flex justify-between items-center mt-1">
            <span className="text-muted-foreground text-sm">Already have an account?</span>
            <Link to="/login" className="text-foreground/80 hover:text-foreground text-sm font-medium transition">Sign In</Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 bg-accent text-accent-foreground font-semibold py-4 rounded-2xl hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Create Account
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">or sign up with</span>
            <div className="flex-1 h-px bg-border"></div>
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
