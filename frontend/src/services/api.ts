import { WaterQualityData } from '@/contexts/DataContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    fileName: string;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    analysis: {
      totalSamples: number;
      safeSamples: number;
      unsafeSamples: number;
      criticalSamples: number;
      safePercentage: number;
      avgHMPI: number;
      avgWQI: number;
    };
    dataId: string;
    validationErrors?: Array<{
      record: number;
      errors: string[];
    }>;
  };
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const err = await response.json();
            if (err && typeof err === 'object' && 'message' in err && err.message) {
              message = err.message as string;
            }
          } else {
            const text = await response.text();
            if (text) message = text;
          }
        } catch {}
        throw new Error(message);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      // Fallback for non-JSON successful responses
      // @ts-expect-error - allow text fallback for generic T
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async uploadWaterQualityFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataSource', 'uploaded');

    const response = await fetch(`${API_BASE_URL}/upload/water-quality-public`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary for FormData
    });

    if (!response.ok) {
      let message = `Upload failed with status: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const err = await response.json();
          if (err && typeof err === 'object' && 'message' in err && err.message) {
            message = err.message as string;
          }
        } else {
          const text = await response.text();
          if (text) message = text;
        }
      } catch {}
      throw new Error(message);
    }

    return await response.json();
  }

  async getWaterQualityStandards() {
    return this.request('/upload/standards');
  }

  async downloadTemplate(format: 'csv' | 'json' = 'csv') {
    const response = await fetch(`${API_BASE_URL}/upload/template?format=${format}`);
    
    if (!response.ok) {
      throw new Error('Failed to download template');
    }

    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'water_quality_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      return await response.json();
    }
  }

  async getSampleData(count: number = 10) {
    return this.request(`/upload/sample-data?count=${count}`);
  }

  async validateData(data: any[]) {
    return this.request('/upload/validate', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getProcessingStatus(dataId: string) {
    return this.request(`/upload/status/${dataId}`);
  }

  async cleanupData(dataId: string) {
    return this.request(`/upload/cleanup/${dataId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
