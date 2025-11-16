import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';


//py-[10px]
export const inputVariants = cva(
  'w-full bg-background border border-input px-3 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium read-only:leading-9 read-only:bg-background disabled:cursor-not-allowed disabled:opacity-50 transition duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0',
  {
    variants: {
      color: {
        default:
          'text-foreground focus:border-primary disabled:bg-muted placeholder:text-muted-foreground',
        primary:
          'border-primary text-primary focus:outline-none focus:border-primary-700 disabled:bg-primary/30 disabled:placeholder:text-primary  placeholder:text-primary/70',
        info: 'border-info/50 text-info focus:outline-none focus:border-info-700 disabled:bg-info/30 disabled:placeholder:text-info  placeholder:text-info/70',
        warning:
          'border-warning/50 text-warning focus:outline-none focus:border-warning-700 disabled:bg-warning/30 disabled:placeholder:text-info  placeholder:text-warning/70',
        success:
          'border-success/50 text-success focus:outline-none focus:border-success-700 disabled:bg-success/30 disabled:placeholder:text-info  placeholder:text-success/70',
        destructive:
          'border-destructive/50 text-destructive focus:outline-none focus:border-destructive-700 disabled:bg-destructive/30 disabled:placeholder:text-destructive  placeholder:text-destructive/70',
      },
      variant: {
        flat: 'bg-default-100 read-only:bg-default-100',
        underline: 'border-b',
        bordered: 'border  ',
        faded: 'border border-default-300 bg-default-100',
        ghost: 'border-0 focus:border',
        'flat-underline': 'bg-default-100 border-b',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-[20px]',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-9 text-sm',
        lg: 'h-10 text-sm',
        xl: 'h-12 text-base',
      },
    },
    compoundVariants: [
      {
        variant: 'flat',
        color: 'primary',
        className: 'bg-primary/10 read-only:bg-primary/10',
      },
      {
        variant: 'flat',
        color: 'info',
        className: 'bg-info/10 read-only:bg-info/10',
      },
      {
        variant: 'flat',
        color: 'warning',
        className: 'bg-warning/10 read-only:bg-warning/10',
      },
      {
        variant: 'flat',
        color: 'success',
        className: 'bg-success/10 read-only:bg-success/10',
      },
      {
        variant: 'flat',
        color: 'destructive',
        className: 'bg-destructive/10 read-only:bg-destructive/10',
      },
      {
        variant: 'faded',
        color: 'primary',
        className: 'bg-primary/10  read-only:bg-primary/10 border-primary/30',
      },
      {
        variant: 'faded',
        color: 'info',
        className: 'bg-info/10 border-info/30',
      },
      {
        variant: 'faded',
        color: 'warning',
        className: 'bg-warning/10 border-warning/30',
      },
      {
        variant: 'faded',
        color: 'success',
        className: 'bg-success/10 border-success/30',
      },
      {
        variant: 'faded',
        color: 'destructive',
        className: 'bg-destructive/10 border-destructive/30',
      },
    ],

    defaultVariants: {
      color: 'default',
      size: 'md',
      variant: 'bordered',
      radius: 'md',
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>,
    VariantProps<typeof inputVariants> {
  removeWrapper?: boolean;
  // size is handled by VariantProps<typeof inputVariants>
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      size,
      color,
      radius,
      variant,
      shadow,
      removeWrapper = false,
      ...props
    },
    ref,
  ) => {
    return removeWrapper ? (
      <input
        type={type}
        className={cn(
          inputVariants({ color, size, radius, variant, shadow }),
          className,
        )}
        ref={ref}
        {...props}
      />
    ) : (
      <div className="flex-1 w-full outline-none">
        <input
          type={type}
          className={cn(
            inputVariants({ color, size, radius, variant, shadow }),
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
