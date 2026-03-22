export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    bg-background">
      <div className="flex flex-col items-center gap-4">
        <span className="text-5xl animate-float">🌱</span>
        <div className="w-8 h-8 border-4 border-primary
                        border-t-transparent rounded-full animate-spin"/>
        <p className="font-heading text-primary font-medium">
          Loading Vriddhi...
        </p>
      </div>
    </div>
  )
}
