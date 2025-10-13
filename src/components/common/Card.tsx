import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export default function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-background-card rounded-lg shadow-card transition-shadow duration-200',
        hover && 'hover:shadow-card-hover cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
