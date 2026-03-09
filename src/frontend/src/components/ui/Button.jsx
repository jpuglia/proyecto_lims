import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20",
    destructive: "bg-error text-white hover:opacity-90",
    outline: "border border-border-light bg-transparent hover:bg-bg-surface text-text-main",
    secondary: "bg-bg-surface text-text-muted hover:text-text-main border border-border-light",
    ghost: "hover:bg-bg-surface text-text-muted hover:text-text-main",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-5 py-2.5",
    sm: "h-8 px-3 rounded-lg text-xs",
    lg: "h-12 px-8 rounded-2xl text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
