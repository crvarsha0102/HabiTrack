import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Meeting, MeetingRequest, MeetingStatus } from '../models/meeting.model';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = `${environment.apiUrl}/meetings`;

  constructor(private http: HttpClient) { }

  // Create a new meeting
  createMeeting(meeting: MeetingRequest): Observable<ApiResponse<Meeting>> {
    console.log('Creating meeting with request:', meeting);
    
    // Validate that propertyId exists
    if (!meeting.propertyId) {
      console.error('Property ID is missing in meeting request');
      return throwError(() => new Error('Property ID is required for scheduling a meeting'));
    }
    
    return this.http.post<ApiResponse<Meeting>>(this.apiUrl, meeting).pipe(
      catchError(error => {
        console.error('Error creating meeting:', error);
        return throwError(() => error);
      })
    );
  }

  // Get a meeting by ID
  getMeeting(id: number): Observable<ApiResponse<Meeting>> {
    return this.http.get<ApiResponse<Meeting>>(`${this.apiUrl}/${id}`);
  }

  // Get upcoming meetings
  getUpcomingMeetings(): Observable<ApiResponse<Meeting[]>> {
    return this.http.get<ApiResponse<Meeting[]>>(`${this.apiUrl}/upcoming`);
  }

  // Get past meetings
  getPastMeetings(): Observable<ApiResponse<Meeting[]>> {
    return this.http.get<ApiResponse<Meeting[]>>(`${this.apiUrl}/past`);
  }

  // Get meetings created by the user
  getCreatedMeetings(): Observable<ApiResponse<Meeting[]>> {
    return this.http.get<ApiResponse<Meeting[]>>(`${this.apiUrl}/created`);
  }

  // Get meetings where the user is a participant
  getParticipatingMeetings(): Observable<ApiResponse<Meeting[]>> {
    return this.http.get<ApiResponse<Meeting[]>>(`${this.apiUrl}/participating`);
  }

  // Get meetings related to a specific message
  getMeetingsByMessageId(messageId: number): Observable<ApiResponse<Meeting[]>> {
    return this.http.get<ApiResponse<Meeting[]>>(`${this.apiUrl}/message/${messageId}`);
  }

  // Accept a meeting invitation
  acceptMeeting(meetingId: number): Observable<ApiResponse<Meeting>> {
    return this.http.post<ApiResponse<Meeting>>(`${this.apiUrl}/${meetingId}/accept`, {});
  }

  // Decline a meeting invitation
  declineMeeting(meetingId: number): Observable<ApiResponse<Meeting>> {
    return this.http.post<ApiResponse<Meeting>>(`${this.apiUrl}/${meetingId}/decline`, {});
  }

  // Cancel a meeting
  cancelMeeting(meetingId: number): Observable<ApiResponse<Meeting>> {
    return this.http.post<ApiResponse<Meeting>>(`${this.apiUrl}/${meetingId}/cancel`, {});
  }

  // Mark a meeting as completed
  completeMeeting(meetingId: number): Observable<ApiResponse<Meeting>> {
    return this.http.post<ApiResponse<Meeting>>(`${this.apiUrl}/${meetingId}/complete`, {});
  }

  // Update meeting details
  updateMeeting(meetingId: number, meeting: MeetingRequest): Observable<ApiResponse<Meeting>> {
    return this.http.put<ApiResponse<Meeting>>(`${this.apiUrl}/${meetingId}`, meeting);
  }

  // Delete a meeting
  deleteMeeting(meetingId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${meetingId}`);
  }

  // Mark user as notified for a meeting
  markNotified(meetingId: number): Observable<ApiResponse<Meeting>> {
    return this.http.post<ApiResponse<Meeting>>(`${this.apiUrl}/${meetingId}/mark-notified`, {});
  }

  // Helper methods to format meeting details
  formatMeetingTime(meeting: Meeting): string {
    if (!meeting.meetingTime) return 'N/A';
    return new Date(meeting.meetingTime).toLocaleString();
  }

  getStatusLabel(status: MeetingStatus): string {
    switch (status) {
      case MeetingStatus.PENDING: return 'Pending';
      case MeetingStatus.ACCEPTED: return 'Accepted';
      case MeetingStatus.DECLINED: return 'Declined';
      case MeetingStatus.CANCELLED: return 'Cancelled';
      case MeetingStatus.COMPLETED: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusColor(status: MeetingStatus): string {
    switch (status) {
      case MeetingStatus.PENDING: return 'warning';
      case MeetingStatus.ACCEPTED: return 'success';
      case MeetingStatus.DECLINED: return 'danger';
      case MeetingStatus.CANCELLED: return 'secondary';
      case MeetingStatus.COMPLETED: return 'info';
      default: return 'primary';
    }
  }
} 