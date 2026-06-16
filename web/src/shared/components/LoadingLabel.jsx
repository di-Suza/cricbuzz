function LoadingLabel({ label = 'Loading', size = 'sm', className = '' }) {
  const sizeClass = size === 'xs' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <span className={`cricket-loader-ball ${sizeClass}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default LoadingLabel;
