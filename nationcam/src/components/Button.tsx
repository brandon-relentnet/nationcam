interface ButtonProps {
  text: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export default function Button({
  text,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg bg-accent px-6 py-3 font-semibold text-crust transition-colors hover:opacity-90 ${className}`}
    >
      {text}
    </button>
  )
}
