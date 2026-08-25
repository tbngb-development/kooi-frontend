// src/components/auth/RegisterForm.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useRegister } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z
  .object({
    tenantName: z.string().min(2, 'Company name must be at least 2 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => {
    const { confirmPassword: _, ...payload } = data;
    register(payload);
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Create your account
        </h2>
        <p className="text-base text-text-muted mt-1">
          Start qualifying leads with AI today
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Input
          label="Company name"
          placeholder="Acme Corp"
          leftIcon={<Building2 size={14} />}
          error={errors.tenantName?.message}
          {...rhfRegister('tenantName')}
        />
        <Input
          label="Your name"
          placeholder="Jane Smith"
          leftIcon={<User size={14} />}
          error={errors.name?.message}
          {...rhfRegister('name')}
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail size={14} />}
          error={errors.email?.message}
          {...rhfRegister('email')}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="At least 8 characters"
          leftIcon={<Lock size={14} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="focus-ring rounded"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          {...rhfRegister('password')}
        />
        <Input
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your password"
          leftIcon={<Lock size={14} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="focus-ring rounded"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...rhfRegister('confirmPassword')}
        />

        <Button
          type="submit"
          loading={isPending}
          className="w-full mt-2"
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-base text-text-muted mt-5">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-500"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}