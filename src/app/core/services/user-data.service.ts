import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/users`;

  /**
   * Export all user data as JSON (GDPR Article 20).
   * Returns the raw response so the caller can trigger a download.
   */
  exportData(): Observable<Blob> {
    return this.http.get(`${this.base}/me/export`, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  /**
   * Permanently delete the user account and all associated data (GDPR Article 17).
   */
  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/me/account`, {
      withCredentials: true,
    });
  }
}
