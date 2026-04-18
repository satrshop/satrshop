/**
 * Utility to export JSON data to CSV and trigger a download.
 */
export function exportToCSV<T extends object>(data: T[], filename: string, headers: { key: string; label: string }[]) {
  if (!data || data.length === 0) return;

  // Create the header row
  const headerRow = headers.map(h => h.label).join(',');
  
  // Create the data rows
  const rows = data.map(item => {
    return headers.map(h => {
      const value = h.key.split('.').reduce((obj: any, key) => obj?.[key], item) ?? '';
      
      // Handle values that might contain commas or newlines
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  const csvContent = [headerRow, ...rows].join('\n');
  
  // Create a blob with UTF-8 BOM to ensure Arabic characters display correctly in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
