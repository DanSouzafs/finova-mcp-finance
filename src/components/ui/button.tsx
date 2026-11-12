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
      default: "bg-emerald-500 text-black hover:bg-emerald-400 font-semibold shadow-sm hover:shadow-emerald-500/20 active:scale-[0.98]",
      destructive: "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98]",
      outline: "border border-border/70 bg-secondary/50 text-foreground hover:bg-secondary hover:text-foreground active:scale-[0.98]",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.98]",
      link: "text-emerald-400 underline-offset-4 hover:underline p-0 h-auto font-normal",
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
