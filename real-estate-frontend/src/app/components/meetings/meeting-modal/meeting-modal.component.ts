import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/user.model';
import { Meeting, MeetingRequest } from '../../../models/meeting.model';
import { MeetingService } from '../../../services/meeting.service';
import { NotificationService } from '../../../services/notification.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-meeting-modal',
  templateUrl: './meeting-modal.component.html',
  styleUrls: ['./meeting-modal.component.scss']
})
export class MeetingModalComponent implements OnInit {
  @Input() otherUser: User | null = null;
  @Input() propertyId?: number;
  @Input() propertyTitle?: string;
  @Input() messageId?: number;
  @Output() meetingCreated = new EventEmitter<Meeting>();

  loading: boolean = false;

  constructor(
    private meetingService: MeetingService,
    private notificationService: NotificationService,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
  }

  onMeetingFormSubmitted(meetingRequest: MeetingRequest): void {
    this.loading = true;
    
    this.meetingService.createMeeting(meetingRequest).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.success && response.data) {
          this.notificationService.success('Meeting scheduled successfully');
          this.meetingCreated.emit(response.data);
          this.activeModal.close(response.data);
        } else {
          this.notificationService.error(response.message || 'Failed to schedule meeting');
        }
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Error scheduling meeting');
        console.error('Error scheduling meeting:', error);
      }
    });
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }
} 