import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textLinkVariants = cva(
  'text-blue-600 hover:text-blue-800 underline underline-offset-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'text-blue-600 hover:text-blue-800',
        destructive: 'text-red-600 hover:text-red-800',
        muted: 'text-gray-600 hover:text-gray-800',
        primary: 'text-primary hover:text-primary/80',
        secondary: 'text-secondary-foreground hover:text-secondary-foreground/80',
      },
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface TextLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof textLinkVariants> {
  href?: string
  asChild?: boolean
}

const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, variant, size, asChild = false, children, href, ...props }, ref) => {
    if (asChild) {
      return (
        <span className={cn(textLinkVariants({ variant, size }), className)} ref={ref} {...props}>
          {children}
        </span>
      )
    }

    return (
      <a
        className={cn(textLinkVariants({ variant, size }), className)}
        href={href}
        ref={ref}
        {...props}
      >
        {children}
      </a>
    )
  }
)
TextLink.displayName = 'TextLink'

export { TextLink, textLinkVariants }
