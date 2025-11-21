import { AssetRecord, AssetCategory, Currency } from '../types';

/**
 * Escapes text for CSV format (handling commas and quotes)
 */
const escapeCsv = (text: string | number | undefined): string => {
  if (text === undefined || text === null) return '';
  const stringValue = String(text);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Converts asset records to CSV string
 */
export const convertToCSV = (records: AssetRecord[]): string => {
  const headers = ['Date', 'Account Name', 'Owner', 'Category', 'Amount', 'Currency', 'Note', 'ID'];
  
  const rows = records.map(record => [
    escapeCsv(record.date),
    escapeCsv(record.accountName),
    escapeCsv(record.owner),
    escapeCsv(record.category),
    escapeCsv(record.amount),
    escapeCsv(record.currency),
    escapeCsv(record.note),
    escapeCsv(record.id),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

/**
 * Triggers a file download in the browser
 */
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validates that the imported data roughly matches the AssetRecord structure
 */
export const validateImportData = (data: any): data is AssetRecord[] => {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true; // Empty array is valid

  // Check the first item for required fields
  const item = data[0];
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'date' in item &&
    'amount' in item &&
    'currency' in item
  );
};
