import { useEffect } from 'react'
import IconGlyph from './IconGlyph.jsx'

export default function Modal({
  isOpen, onClose, title,
  children, size = 'md',
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className={`relative bg-white rounded-3xl w-full ${sizes[size]}
                    shadow-2xl p-6 z-10 animate-slide-up`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="font-bold text-dark text-lg">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center
                       justify-center text-gray-500 hover:bg-gray-200
                       transition-all ml-auto"
          >
            <IconGlyph name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
