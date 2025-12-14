import clsx from 'clsx';
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
};

export function Button({ className, variant = 'primary', size = 'md', asChild, ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-300 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 border border-brand-600',
    secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200',
    ghost: 'text-slate-700 hover:bg-slate-100 border border-transparent',
    outline: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    destructive: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'h-9 w-9 p-0',
  };

  const Comp: any = asChild ? 'span' : 'button';
  return <Comp className={clsx(base, variants[variant], sizes[size], className)} {...props} />;
}
