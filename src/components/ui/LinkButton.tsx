import { Link, buttonVariants, cn } from '@heroui/react'
import type { ButtonVariants, LinkProps } from '@heroui/react'

type LinkButtonProps = Omit<LinkProps, 'variant'> &
  Pick<ButtonVariants, 'variant' | 'size' | 'fullWidth'>

/**
 * A navigation control that looks like a button.
 *
 * HeroUI's `Button` renders a `<button>` and takes no `href`, so anything that
 * navigates is built from `Link` instead. That keeps middle-click, "open in new
 * tab", and screen-reader link semantics working, while reusing the exact
 * button styling from HeroUI's theme.
 */
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
