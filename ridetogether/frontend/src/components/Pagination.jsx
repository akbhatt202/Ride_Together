import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '2rem' }}>
      <button
        className="btn btn-outline btn-sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '0.4rem 0.6rem' }}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-outline'}`}
          style={{ minWidth: '36px' }}
        >
          {p}
        </button>
      ))}

      <button
        className="btn btn-outline btn-sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '0.4rem 0.6rem' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
