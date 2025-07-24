export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface p-6 rounded-2xl shadow-md ${className}`}>
      {children}
    </div>
  )
}