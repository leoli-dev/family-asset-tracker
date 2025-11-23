
import { AssetRecord, Account, Category, Owner, FullBackup } from '../types';

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
 * Converts asset records to CSV string with extended details (IDs)
 */
export const convertToCSV = (
  records: AssetRecord[],
  accounts: Account[],
  categories: Category[],
  owners: Owner[]
): string => {
  // Added ID columns so data is machine-readable and restorable if needed manually
  const headers = [
      'Date', 
      'Account Name', 'Account ID', 
      'Owner Name', 'Owner ID', 
      'Category Name', 'Category ID', 
      'Amount', 'Currency', 'Note', 'Record ID'
  ];
  
  const rows = records.map(record => {
    const account = accounts.find(a => a.id === record.accountId);
    // Category is now derived from the Account
    const category = account ? categories.find(c => c.id === account.categoryId) : undefined;
    const owner = owners.find(o => o.id === record.ownerId);
    
    return [
      escapeCsv(record.date),
      escapeCsv(account?.name || 'Unknown'),
      escapeCsv(record.accountId),
      escapeCsv(owner?.name || 'Unknown'),
      escapeCsv(record.ownerId),
      escapeCsv(category?.name || 'Unknown'),
      escapeCsv(account?.categoryId || ''),
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
 * Validates that the imported data matches either the new FullBackup structure or the old AssetRecord[] structure.
 * Returns a normalized FullBackup object or null.
 */
export const validateImportData = (data: any): FullBackup | null => {
  if (!data || typeof data !== 'object') return null;

  // Case 1: New Full Backup Format
  if (Array.isArray(data.records) && Array.isArray(data.accounts)) {
      return {
          metadata: data.metadata || { version: '2.0', timestamp: Date.now(), exportDate: new Date().toISOString() },
          records: data.records,
          accounts: data.accounts,
          categories: data.categories || [],
          owners: data.owners || []
      };
  }

  // Case 2: Old Backup Format (Just an array of records)
  // We infer it's a list of records if it's an array and looks like records
  if (Array.isArray(data)) {
      if (data.length === 0) {
          return { metadata: { version: 'legacy', timestamp: Date.now(), exportDate: '' }, records: [], accounts: [], categories: [], owners: [] };
      }
      // Check first item
      if ('date' in data[0] && 'amount' in data[0] && 'accountId' in data[0]) {
           return {
               metadata: { version: 'legacy', timestamp: Date.now(), exportDate: new Date().toISOString() },
               records: data as AssetRecord[],
               accounts: [], // Old backups didn't have these, will result in empty lists (IDs only)
               categories: [],
               owners: []
           };
      }
  }

  return null;
};
