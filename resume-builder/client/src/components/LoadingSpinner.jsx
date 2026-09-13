export default function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: '0.75rem',
    md: '1.25rem',
    lg: '2rem'
  };

  return (
    <div
      className="loading"
      style={{
        width: sizes[size],
        height: sizes[size],
        borderWidth: size === 'sm' ? '1.5px' : '2px'
      }}
      role="status"
      aria-label="Loading"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}