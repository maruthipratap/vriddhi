import SoilAnalyzer from '../../components/ai/SoilAnalyzer.jsx'

export default function FertilizerAdvisor() {
  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">🧪 Fertilizer Advisor</h2>
        <p className="text-green-200 text-sm">AI-powered fertilizer schedule</p>
      </div>
      <div className="px-4 mt-4">
        <SoilAnalyzer />
      </div>
    </div>
  )
}