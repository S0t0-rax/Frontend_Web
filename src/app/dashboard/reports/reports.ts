import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent {
  startDate: string = '';
  endDate: string = '';
  status: string = '';

  isDownloadingExcel = false;
  isDownloadingPdf = false;

  constructor(private http: HttpClient) {}

  downloadExcel() {
    this.isDownloadingExcel = true;
    const url = this.buildUrl('/api/v1/reports/incidents/excel');
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.saveFile(blob, `Reporte_${new Date().getTime()}.xlsx`);
        this.isDownloadingExcel = false;
      },
      error: (err) => {
        console.error('Error descargando Excel:', err);
        alert('Error al generar el reporte');
        this.isDownloadingExcel = false;
      }
    });
  }

  downloadPdf() {
    this.isDownloadingPdf = true;
    const url = this.buildUrl('/api/v1/reports/incidents/pdf');
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.saveFile(blob, `Reporte_${new Date().getTime()}.pdf`);
        this.isDownloadingPdf = false;
      },
      error: (err) => {
        console.error('Error descargando PDF:', err);
        alert('Error al generar el reporte');
        this.isDownloadingPdf = false;
      }
    });
  }

  private buildUrl(path: string): string {
    let url = `${environment.apiUrl}${path}?`;
    if (this.startDate) url += `start_date=${this.startDate}&`;
    if (this.endDate) url += `end_date=${this.endDate}&`;
    if (this.status) url += `status=${this.status}&`;
    return url;
  }

  private saveFile(blob: Blob, filename: string) {
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}
