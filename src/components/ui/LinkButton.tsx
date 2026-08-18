import { Link, buttonVariants, cn } from '@heroui/react'
import type { ButtonVariants, LinkProps } from '@heroui/react'

type LinkButtonProps = Omit<LinkProps, 'variant'> &
  Pick<ButtonVariants, 'variant' | 'size' | 'fullWidth'>


export function LinkButton({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={cn(
        buttonVariants({ variant, size, fullWidth }),
        'no-underline',
        className,
      )}
    />
  )
}
