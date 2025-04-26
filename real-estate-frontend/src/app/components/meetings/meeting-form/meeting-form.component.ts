import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeetingRequest } from '../../../models/meeting.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-meeting-form',
  templateUrl: './meeting-form.component.html',
  styleUrls: ['./meeting-form.component.scss']
})
export class MeetingFormComponent implements OnInit {
  @Input() participant: User | null = null;
  @Input() propertyId?: number;
  @Input() messageId?: number;
  @Output() submit = new EventEmitter<MeetingRequest>();
  @Output() cancel = new EventEmitter<void>();

  meetingForm: FormGroup;
  minDate: string;

  constructor(private fb: FormBuilder) {
    // Set minimum date to today
    const today = new Date();
    today.setHours(today.getHours() + 1); // At least 1 hour in the future
    this.minDate = today.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm

    this.meetingForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      meetingTime: [today.toISOString().slice(0, 16), Validators.required],
      durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      location: [''],
      meetingLink: ['', Validators.pattern('^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$')]
    });
  }

  ngOnInit(): void {
    // If we have a property ID, try to set a better title
    if (this.propertyId) {
      console.log('Have propertyId in meeting form:', this.propertyId);
    }
  }

  // Set a more informative title if we get property information
  @Input() set propertyName(name: string) {
    if (name && this.meetingForm) {
      const currentTitle = this.meetingForm.get('title')?.value || '';
      
      // Only update if it seems like a generic title
      if (!currentTitle || currentTitle === 'Meeting about property' || currentTitle.includes('Untitled Property')) {
        this.meetingForm.patchValue({
          title: `Meeting: ${name}`
        });
        console.log('Updated meeting title with property name:', name);
      }
    }
  }

  onSubmit(): void {
    if (this.meetingForm.valid && this.participant) {
      const formValue = this.meetingForm.value;
      
      // Convert meeting time to ISO format
      const meetingTime = new Date(formValue.meetingTime);
      
      const meetingRequest: MeetingRequest = {
        participantId: this.participant.id as number,
        title: formValue.title,
        description: formValue.description,
        meetingTime: meetingTime.toISOString(),
        durationMinutes: formValue.durationMinutes,
        location: formValue.location,
        meetingLink: formValue.meetingLink,
        propertyId: this.propertyId,
        messageId: this.messageId
      };
      
      this.submit.emit(meetingRequest);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
} 