import React from 'react';

export default function SkeletonCard(){
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="w-1/2 h-5 skeleton rounded"></div>
        <div className="w-20 h-7 skeleton rounded"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-24 h-4 skeleton rounded"></div>
        <div className="w-16 h-4 skeleton rounded"></div>
      </div>
      <div className="mt-3 w-full h-10 skeleton rounded"></div>
    </div>
  );
}
