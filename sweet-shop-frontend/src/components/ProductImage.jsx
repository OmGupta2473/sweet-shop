import React from 'react';

export default function ProductImage({ src, alt }) {
  const [error, setError] = React.useState(false);
  return (
    <img
      src={error || !src ? '/placeholder.png' : src}
      alt={alt}
      className="w-full h-32 object-cover rounded mb-2 bg-gray-100"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
