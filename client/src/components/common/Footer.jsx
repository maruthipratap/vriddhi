import IconGlyph from './IconGlyph.jsx'

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-8 px-4 mt-8">
      <div className="text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-white/10 items-center justify-center text-gold mb-2">
          <IconGlyph name="wheat" size={24} />
        </div>
        <p className="font-display font-bold text-gold text-lg">Vriddhi</p>
        <p className="text-green-300 text-xs mt-1">
          Grow More. Earn More. Live More.
        </p>
        <p className="text-gray-500 text-xs mt-4">
          <span className="inline-flex items-center gap-1">
            © 2025 Vriddhi. Made with <IconGlyph name="heart" size={12} className="text-gold" /> for Indian Farmers.
          </span>
        </p>
      </div>
    </footer>
  )
}
