// src/components/ui/Button.jsx
const styles = {
  primary:   'bg-accent text-background',
  secondary: 'bg-surface text-text-primary',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`${styles[variant]} py-4 px-6 rounded-full transition hover:opacity-90 ${className}`}
      {...props}
    />
  );
}