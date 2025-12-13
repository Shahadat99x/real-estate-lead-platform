import clsx from 'clsx';
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  asChild?: boolean;
};

export function Button({ className, variant = 'primary', asChild, ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-300';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 border border-brand-600',
    secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200',
    ghost: 'text-slate-700 hover:bg-slate-100 border border-transparent',
  };
  const Comp: any = asChild ? 'span' : 'button';
  return <Comp className={clsx(base, variants[variant], className)} {...props} />;
}
