export default function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 bg-gray-700 rounded-lg overflow-hidden">
      <div
        className="h-full bg-secondary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}