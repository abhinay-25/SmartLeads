import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginSchema } from '@lib/authSchemas';
import { loginApi } from '@services/auth.service';
import { useAuthStore } from '@store/authStore';
import { Button } from '@components/ui/Button';
import { AuthField, PasswordField } from '@components/auth/AuthField';

export const LoginPage = () => {
  const navigate        = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginSchema) => {
    try {
      const result = await loginApi(values);
      setAuth(result.user, result.tokens);
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Try again.';
      // Show the error under the password field — vague for security
      setError('password', { message });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
          Sign in
        </h2>
        <p className="mt-1.5 text-sm text-[hsl(var(--text-secondary))]">
          Welcome back — enter your credentials to continue.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <AuthField
          id="email"
          label="Email address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          error={errors.email?.message}
          leftIcon={<Mail size={15} />}
          {...register('email')}
        />

        <PasswordField
          id="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          leftIcon={<Lock size={15} />}
          {...register('password')}
        />

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          className="mt-2 w-full"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-[hsl(var(--text-secondary))]">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-medium text-[hsl(var(--brand))] transition-colors hover:text-[hsl(var(--brand-hover))]"
        >
          Create one
        </Link>
      </p>
    </div>
  );
};
