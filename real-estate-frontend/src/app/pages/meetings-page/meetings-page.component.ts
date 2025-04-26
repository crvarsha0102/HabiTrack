import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meeting } from '../../models/meeting.model';
import { MeetingService } from '../../services/meeting.service';
import { NotificationService } from '../../services/notification.service';
import { MeetingsListComponent } from '../../components/meetings/meetings-list/meetings-list.component';

@Component({
  selector: 'app-meetings-page',
  templateUrl: './meetings-page.component.html',
  styleUrls: ['./meetings-page.component.scss'],
  standalone: true,
  imports: [CommonModule, MeetingsListComponent]
})
export class MeetingsPageComponent implements OnInit {
  upcomingMeetings: Meeting[] = [];
  pastMeetings: Meeting[] = [];
  loading: boolean = true;
  selectedTab: 'upcoming' | 'past' = 'upcoming';

  constructor(
    private meetingService: MeetingService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.loading = true;
    
    // Load upcoming meetings
    this.meetingService.getUpcomingMeetings().subscribe({
      next: (response) => {
        if (response.success) {
          this.upcomingMeetings = response.data || [];
        } else {
          this.notificationService.error(response.message || 'Failed to load upcoming meetings');
        }
      },
      error: (error) => {
        this.notificationService.error('Error loading upcoming meetings');
        console.error('Error loading upcoming meetings:', error);
      }
    });
    
    // Load past meetings
    this.meetingService.getPastMeetings().subscribe({
      next: (response) => {
        if (response.success) {
          this.pastMeetings = response.data || [];
        } else {
          this.notificationService.error(response.message || 'Failed to load past meetings');
        }
      },
      error: (error) => {
        this.notificationService.error('Error loading past meetings');
        console.error('Error loading past meetings:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  changeTab(tab: 'upcoming' | 'past'): void {
    this.selectedTab = tab;
  }

  onMeetingUpdated(meeting: Meeting): void {
    // Refresh the meetings list
    this.loadMeetings();
    this.notificationService.success('Meeting updated successfully');
  }
} 