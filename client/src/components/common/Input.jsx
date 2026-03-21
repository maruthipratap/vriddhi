export default function Input({
  label, error, hint, type = 'text',
  placeholder, value, onChange,
  required = false, disabled = false,
  className = '', icon,
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            input
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-red-400 focus:ring-red-400' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}