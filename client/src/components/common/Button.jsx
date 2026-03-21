export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  disabled = false, loading = false,
  className = '', fullWidth = false,
}) {
  const variants = {
    primary:  'bg-forest text-white hover:bg-dark',
    gold:     'bg-gold text-dark hover:opacity-90',
    outline:  'border-2 border-forest text-forest hover:bg-green-50',
    danger:   'bg-red-500 text-white hover:bg-red-600',
    ghost:    'text-forest hover:bg-green-50',
  }
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-semibold transition-all duration-200
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current
                        border-t-transparent rounded-full animate-spin"/>
      )}
      {children}
    </button>
  )
}