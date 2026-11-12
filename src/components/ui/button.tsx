import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "btn-default bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold shadow-xs hover:shadow-emerald-500/20 active:scale-[0.98]",
      destructive: "btn-destructive bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 active:scale-[0.98]",
      outline: "btn-outline border border-border bg-card text-foreground hover:bg-secondary hover:text-foreground active:scale-[0.98] shadow-xs",
      secondary: "btn-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/80 active:scale-[0.98] shadow-xs",
      ghost: "btn-ghost text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-[0.98]",
      link: "btn-link text-emerald-500 underline-offset-4 hover:underline p-0 h-auto font-normal",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm rounded-lg",
      sm: "h-8 px-3 text-xs rounded-md",
      lg: "h-11 px-6 text-base rounded-lg",
      icon: "h-9 w-9 p-0 flex items-center justify-center rounded-lg",
    };

    const combinedClassName = cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      variantStyles[variant],
      variant !== "link" && sizeStyles[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(combinedClassName, (children.props as any)?.className),
        ...props,
      });
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
