
import { AssetRecord, Account, Category, Owner } from '../types';

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
export const convertToCSV = (
  records: AssetRecord[],
  accounts: Account[],
  categories: Category[],
  owners: Owner[]
): string => {
  const headers = ['Date', 'Account Name', 'Owner', 'Category', 'Amount', 'Currency', 'Note', 'ID'];
  
  const rows = records.map(record => {
    const account = accounts.find(a => a.id === record.accountId);
    const category = categories.find(c => c.id === record.categoryId);
    const owner = owners.find(o => o.id === record.ownerId);
    
    return [
      escapeCsv(record.date),
      escapeCsv(account?.name || record.accountId),
      escapeCsv(owner?.name || record.ownerId),
      escapeCsv(category?.name || record.categoryId),
      escapeCsv(record.amount),
      escapeCsv(account?.currency || ''),
      escapeCsv(record.note),
      escapeCsv(record.id),
    ];
  });

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
    'amount' in item
  );
};