import Image from 'next/image'

type Props = {
  /** `onDark`: white logo for ocean/dark backgrounds */
  variant?: 'default' | 'onDark'
  className?: string
}

export default function SiteLogo({ variant = 'default', className = '' }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="Awesome — 奥漫旅游新加坡"
      width={160}
      height={160}
      className={`object-contain shrink-0 ${
        variant === 'onDark' ? 'brightness-0 invert opacity-95' : ''
      } ${className}`.trim()}
      priority
    />
  )
}
