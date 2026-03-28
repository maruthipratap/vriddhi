import IconGlyph from './IconGlyph.jsx'

export default function Loader({ icon = "sprout", text = "Loading Vriddhi...", fullScreen = true }) {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : 'h-full flex-1 min-h-[50vh]'} flex flex-col items-center justify-center bg-background`}>
      <div className="flex flex-col items-center gap-4">
        <span className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-float">
          <IconGlyph name={icon} size={30} />
        </span>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
        <p className="font-heading text-primary font-medium">
          {text}
        </p>
      </div>
    </div>
  )
}
