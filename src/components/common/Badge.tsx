import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'official';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  const variantClasses = {
    primary: 'bg-[#7565F7]/10 text-[#7565F7] font-semibold border border-[#7565F7]/20',
    accent: 'bg-[#D5F36B] text-[#191827] font-bold border border-[#c4e457]',
    secondary: 'bg-[#F0EEF9] text-[#77778A] font-medium border border-[#E9E7F1]',
    outline: 'bg-transparent text-[#77778A] border border-[#E9E7F1]',
    danger: 'bg-rose-50 text-rose-600 font-medium border border-rose-100',
    success: 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 font-medium border border-amber-100',
    official: 'bg-gradient-to-r from-[#7565F7] to-[#8E80FF] text-white font-semibold shadow-xs',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors whitespace-nowrap ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};
