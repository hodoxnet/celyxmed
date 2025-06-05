"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AnimatedButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  showIcon?: boolean;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon = ArrowRight,
  iconPosition = 'left',
  showIcon = true,
  className,
  disabled = false,
  fullWidth = false,
}) => {
  const baseClasses = "group relative inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-500 ease-out overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2.5"
  };

  const variantClasses = {
    primary: "bg-white text-gray-800 hover:bg-gray-50 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1",
    secondary: "bg-[#486F79] hover:bg-[#406069] text-white shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1",
    outline: "bg-transparent text-white border-2 border-white/30 hover:border-white/60 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1",
    ghost: "bg-transparent text-[#486F79] hover:text-[#406069] border border-[#486F79] hover:bg-[#486F79]/10 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1",
    link: "bg-transparent text-inherit hover:text-[#406069] underline-offset-4 hover:underline transform hover:scale-105"
  };

  const iconClasses = {
    primary: "bg-[#486F79] text-white p-1.5 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300",
    secondary: "bg-[#d4b978] text-white p-1.5 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300", 
    outline: "text-white group-hover:scale-110 transition-all duration-300",
    ghost: "text-[#486F79] group-hover:scale-110 transition-all duration-300",
    link: "text-inherit group-hover:translate-x-1 transition-transform duration-300"
  };

  const gradientOverlays = {
    primary: "absolute inset-0 bg-gradient-to-r from-[#486F79] to-[#5a8791] opacity-0 group-hover:opacity-10 transition-opacity duration-500",
    secondary: "absolute inset-0 bg-gradient-to-r from-[#d4b978] to-[#e6c78a] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
    outline: "absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out",
    ghost: "absolute inset-0 bg-gradient-to-r from-[#486F79]/10 to-[#486F79]/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out",
    link: ""
  };

  const classes = cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && "w-full",
    className
  );

  const iconElement = showIcon && (
    <div className={cn(
      iconClasses[variant],
      iconPosition === 'right' && "order-last"
    )}>
      <Icon className={cn(
        "h-4 w-4",
        variant === 'link' && "transition-transform duration-300"
      )} />
    </div>
  );

  if (disabled) {
    return (
      <span className={classes}>
        {gradientOverlays[variant] && <div className={gradientOverlays[variant]} />}
        {iconPosition === 'left' && iconElement}
        <span className="relative z-10">{children}</span>
        {iconPosition === 'right' && iconElement}
      </span>
    );
  }

  return (
    <Link href={href} className={classes}>
      {gradientOverlays[variant] && <div className={gradientOverlays[variant]} />}
      {iconPosition === 'left' && iconElement}
      <span className="relative z-10">{children}</span>
      {iconPosition === 'right' && iconElement}
    </Link>
  );
};

// Specialized Button Components
export const PrimaryAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="primary" />
);

export const SecondaryAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="secondary" />
);

export const OutlineAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="outline" />
);

export const GhostAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="ghost" />
);

export const LinkAnimatedButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="link" />
);

export default AnimatedButton;