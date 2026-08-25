// src/app/(admin-auth)/admin/login/page.tsx

'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAdminLogin } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useAdminLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Super Admin Login
        </h2>
        <p className="text-base text-text-muted mt-1">
          Restricted access — authorized personnel only
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => login(data))}
        className="flex flex-col gap-4"
      >
        <Input
          label="Admin email"
          type="email"
          placeholder="admin@system.com"
          leftIcon={<Mail size={14} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
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
          {...register('password')}
        />
        <Button
          type="submit"
          loading={isPending}
          className="w-full mt-2"
        >
          Sign in as Admin
        </Button>
      </form>
    </Card>
  );
}