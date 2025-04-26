import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Meeting, MeetingStatus } from '../../../models/meeting.model';
import { MeetingService } from '../../../services/meeting.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-meetings-list',
  templateUrl: './meetings-list.component.html',
  styleUrls: ['./meetings-list.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe]
})
export class MeetingsListComponent implements OnInit {
  @Input() meetings: Meeting[] = [];
  @Input() title: string = 'Meetings';
  @Input() showActions: boolean = true;
  @Input() emptyMessage: string = 'No meetings found';
  @Output() meetingUpdated = new EventEmitter<Meeting>();

  currentUserId: number | null = null;
  MeetingStatus = MeetingStatus; // Make enum accessible in template

  constructor(
    private meetingService: MeetingService, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
  }

  formatMeetingTime(meeting: Meeting): string {
    return this.meetingService.formatMeetingTime(meeting);
  }

  getStatusLabel(status: MeetingStatus): string {
    return this.meetingService.getStatusLabel(status);
  }

  getStatusColor(status: MeetingStatus): string {
    return this.meetingService.getStatusColor(status);
  }

  isCreator(meeting: Meeting): boolean {
    return meeting.creatorId === this.currentUserId;
  }

  isParticipant(meeting: Meeting): boolean {
    return meeting.participantId === this.currentUserId;
  }

  canAcceptOrDecline(meeting: Meeting): boolean {
    return this.isParticipant(meeting) && meeting.status === MeetingStatus.PENDING;
  }

  canCancel(meeting: Meeting): boolean {
    return this.isCreator(meeting) && 
      (meeting.status === MeetingStatus.PENDING || meeting.status === MeetingStatus.ACCEPTED);
  }

  canComplete(meeting: Meeting): boolean {
    return (this.isCreator(meeting) || this.isParticipant(meeting)) && 
      meeting.status === MeetingStatus.ACCEPTED && 
      new Date(meeting.meetingTime) < new Date();
  }

  acceptMeeting(meeting: Meeting): void {
    this.meetingService.acceptMeeting(meeting.id!).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.meetingUpdated.emit(response.data);
        }
      },
      error: (error) => {
        console.error('Error accepting meeting:', error);
      }
    });
  }

  declineMeeting(meeting: Meeting): void {
    this.meetingService.declineMeeting(meeting.id!).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.meetingUpdated.emit(response.data);
        }
      },
      error: (error) => {
        console.error('Error declining meeting:', error);
      }
    });
  }

  cancelMeeting(meeting: Meeting): void {
    this.meetingService.cancelMeeting(meeting.id!).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.meetingUpdated.emit(response.data);
        }
      },
      error: (error) => {
        console.error('Error cancelling meeting:', error);
      }
    });
  }

  completeMeeting(meeting: Meeting): void {
    this.meetingService.completeMeeting(meeting.id!).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.meetingUpdated.emit(response.data);
        }
      },
      error: (error) => {
        console.error('Error completing meeting:', error);
      }
    });
  }
} 