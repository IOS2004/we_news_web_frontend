import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-medium text-text-primary mb-1">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          className={cn(
            'px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all',
            error
              ? 'border-danger focus:ring-danger'
              : 'border-gray-300 focus:ring-primary',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        
        {error && (
          <span className="text-xs text-danger mt-1">{error}</span>
        )}
        
        {helperText && !error && (
          <span className="text-xs text-text-secondary mt-1">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
