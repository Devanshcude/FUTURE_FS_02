export function exportToCSV(leads, filename = 'leads') {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Company',
    'Source',
    'Status',
    'Priority',
    'Assigned To',
    'Created At',
    'Updated At',
  ];

  const rows = leads.map((lead) => [
    lead.name || '',
    lead.email || '',
    lead.phone || '',
    lead.company || '',
    lead.source || '',
    lead.status || '',
    lead.priority || '',
    lead.assignedTo || '',
    lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '',
    lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
