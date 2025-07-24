const styles = {
  primary:   'bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition',
  secondary: 'bg-surface text-text-primary py-3 px-6 rounded-lg hover:bg-surface/90 transition'
}

export default function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={styles[variant]} {...props}>
      {children}
    </button>
  )
}