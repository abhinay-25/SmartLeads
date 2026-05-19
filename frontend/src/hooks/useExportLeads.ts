import { useState } from 'react';
import toast from 'react-hot-toast';
import { exportLeads } from '@services/lead.service';
import type { LeadsQueryParams } from '@/types';

export const useExportLeads = () => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadCSV = async (params: LeadsQueryParams) => {
    try {
      setIsExporting(true);
      
      const blob = await exportLeads(params);
      
      // Create a temporary object URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      
      // Generate a professional timestamped filename
      const date = new Date().toISOString().split('T')[0];
      a.download = `leads_export_${date}.csv`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Leads exported successfully');
    } catch (error) {
      toast.error('Failed to export leads. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return { downloadCSV, isExporting };
};
