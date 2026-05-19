import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock } from 'lucide-react';
import { registerSchema, type RegisterSchema } from '@lib/authSchemas';
import { registerApi } from '@services/auth.service';
import { useAuthStore } from '@store/authStore';
import { Button } from '@components/ui/Button';
import { AuthField, PasswordField } from '@components/auth/AuthField';

// ── Password strength indicator ───────────────────────────────────

const getPasswordStrength = (password: string) => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  if (score <= 2) return { label: 'Weak',   color: 'hsl(var(--danger))',  width: '20%' };
  if (score === 3) return { label: 'Fair',   color: 'hsl(var(--warning))', width: '50%' };
  if (score === 4) return { label: 'Good',   color: 'hsl(142 60% 45%)',    width: '75%' };
  return              { label: 'Strong', color: 'hsl(var(--success))',  width: '100%' };
};

// ── Page ──────────────────────────────────────────────────────────

export const RegisterPage = () => {
  const navigate                     = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',  // validate on blur for better UX than onChange
  });

  const passwordValue = watch('password', '');
  const strength = passwordValue.length > 0 ? getPasswordStrength(passwordValue) : null;

  const onSubmit = async (values: RegisterSchema) => {
    try {
      const result = await registerApi(values);
      setAuth(result.user, result.tokens);
      toast.success(`Account created! Welcome, ${result.user.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Try again.';
      if (message.toLowerCase().includes('email')) {
        setError('email', { message });
      } else {
        setError('root', { message });
      }
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-[hsl(var(--text-secondary))]">
          Start managing your leads in minutes.
        </p>
      </div>

      {/* Root error banner */}
      {errors.root?.message && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-bg))] px-4 py-3 text-sm text-[hsl(var(--danger))]"
        >
          {errors.root.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <AuthField
          id="name"
          label="Full name"
          type="text"
          placeholder="Alice Johnson"
          autoComplete="name"
          autoFocus
          error={errors.name?.message}
          leftIcon={<User size={15} />}
          {...register('name')}
        />

        <AuthField
          id="email"
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          leftIcon={<Mail size={15} />}
          {...register('email')}
        />

        <div className="flex flex-col gap-2">
          <PasswordField
            id="password"
            label="Password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            leftIcon={<Lock size={15} />}
            {...register('password')}
          />

          {/* Password strength meter */}
          {strength && (
            <div className="space-y-1.5">
              <div className="h-1 w-full overflow-hidden rounded-full bg-[hsl(var(--bg-muted))]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: strength.width, backgroundColor: strength.color }}
                />
              </div>
              <p className="text-[11px]" style={{ color: strength.color }}>
                {strength.label} password
              </p>
            </div>
          )}
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock size={15} />}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="mt-2 w-full"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-[11px] text-[hsl(var(--text-tertiary))]">
          By creating an account you agree to our{' '}
          <a href="#" className="underline hover:text-[hsl(var(--text-secondary))]">
            Terms of Service
          </a>
        </p>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-[hsl(var(--text-secondary))]">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-[hsl(var(--brand))] transition-colors hover:text-[hsl(var(--brand-hover))]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
