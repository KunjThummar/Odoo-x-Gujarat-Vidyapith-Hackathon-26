import React from 'react';

const configs = {
  // Trip statuses
  DRAFT:       { label: 'Draft',       cls: 'bg-slate-100 text-slate-600' },
  DISPATCHED:  { label: 'Dispatched',  cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
  COMPLETED:   { label: 'Completed',   cls: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-600' },
  // Vehicle statuses
  AVAILABLE:   { label: 'Available',   cls: 'bg-green-100 text-green-700' },
  IN_USE:      { label: 'In Use',      cls: 'bg-blue-100 text-blue-700' },
  IN_SHOP:     { label: 'In Shop',     cls: 'bg-red-100 text-red-600' },
  // Driver statuses
  'On Duty':   { label: 'On Duty',     cls: 'bg-green-100 text-green-700' },
  'On Break':  { label: 'On Break',    cls: 'bg-amber-100 text-amber-700' },
  'Suspended': { label: 'Suspended',   cls: 'bg-red-100 text-red-600' },
};

export default function StatusBadge({ status }) {
  const config = configs[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.cls}`}>
      {config.label}
    </span>
  );
}
