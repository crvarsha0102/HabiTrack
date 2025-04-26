import { Component, OnInit, Inject, PLATFORM_ID, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PropertyService } from '../../services/property.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// Import Modal type but don't directly import bootstrap
import type { Modal } from 'bootstrap';
import { BootstrapHelper } from '../../utils/bootstrap-helper';
import { EXTENDED_TIMEOUT } from '../../interceptors/timeout.interceptor';
import { MeetingService } from '../../services/meeting.service';
import { Meeting, MeetingStatus } from '../../models/meeting.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class MessagesComponent implements OnInit, AfterViewInit {
  @ViewChild('replyModalElement') replyModalElement?: ElementRef;
  @ViewChild('scheduleMeetingModalElement') scheduleMeetingModalElement?: ElementRef;
  
  messages: any[] = [];
  loading = true;
  error: string | null = null;
  activeTab: 'inbox' | 'sent' = 'inbox'; // Explicitly type the activeTab
  propertiesCache: { [key: number]: any } = {};
  
  // Reply modal related properties
  replyModal: any = null;
  replyForm: FormGroup;
  selectedMessage: any = null;
  replySending = false;
  replySuccess = false;
  replyError: string | null = null;
  isBrowser: boolean;
  
  // Meeting modal related properties
  meetingModal: any = null;
  meetingForm: FormGroup;
  meetingScheduling = false;
  meetingSuccess = false;
  meetingError: string | null = null;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private propertyService: PropertyService,
    private meetingService: MeetingService,
    fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private notificationService: NotificationService
  ) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Initialize form in constructor instead of ngOnInit
    this.replyForm = fb.group({
      subject: ['Re: Property Inquiry', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
    
    // Initialize meeting form
    const today = new Date();
    today.setHours(today.getHours() + 1);
    
    this.meetingForm = fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      meetingTime: [today.toISOString().slice(0, 16), Validators.required],
      durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      location: [''],
      meetingLink: ['', Validators.pattern('^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$')]
    });
  }

  ngOnInit(): void {
    // Skip message loading during server-side rendering
    if (!this.isBrowser) {
      console.log('Server-side rendering - skipping message loading');
      this.loading = false;
      return;
    }
    
    // Use setTimeout to delay loading until after hydration is complete
    setTimeout(() => {
      console.log('Delayed initialization to avoid hydration issues');
      this.initializeMessagesComponent();
    }, 100);
  }
  
  ngAfterViewInit(): void {
    if (this.isBrowser && this.replyModalElement) {
      this.initializeModal();
    }
    
    // Initialize Bootstrap modals in browser environment only
    if (this.isBrowser) {
      // For reply modal
      if (typeof window !== 'undefined' && this.replyModalElement) {
        import('bootstrap').then(({ Modal }) => {
          this.replyModal = new Modal(this.replyModalElement?.nativeElement);
        }).catch(err => console.error('Could not load Bootstrap modal:', err));
      }
      
      // For meeting scheduling modal
      if (typeof window !== 'undefined' && this.scheduleMeetingModalElement) {
        import('bootstrap').then(({ Modal }) => {
          this.meetingModal = new Modal(this.scheduleMeetingModalElement?.nativeElement);
        }).catch(err => console.error('Could not load Bootstrap modal:', err));
      }
    }
  }
  
  // Initialize Bootstrap modal only in browser environment
  private async initializeModal(): Promise<void> {
    if (this.replyModalElement?.nativeElement) {
      this.replyModal = await BootstrapHelper.createModal(
        this.replyModalElement.nativeElement,
        this.isBrowser
      );
    }
  }
  
  // Moved initialization logic to a separate method for clarity
  private initializeMessagesComponent(): void {
    // Check if user is logged in before trying to load messages
    if (!this.authService.isLoggedIn()) {
      console.log('Not logged in according to isLoggedIn()');
      
      // Check token directly as a last resort
      const token = this.authService.getToken();
      if (token) {
        console.log('Token found, attempting to use it');
        // Force the isLoggedIn flag to be true
        localStorage.setItem('isLoggedIn', 'true');
        
        // We have a token, let's try to load messages
        setTimeout(() => this.loadMessages(), 100);
      } else {
        this.error = 'You must be logged in to view messages';
        this.loading = false;
        
        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: '/messages' } 
          });
        }, 2000);
      }
      return;
    }
    
    this.loadMessages();
  }
  
  loadMessages(): void {
    this.loading = true;
    this.error = null;
    
    // If we're not in a browser context, skip loading
    if (!this.isBrowser) {
      console.log('Not in browser context, skipping message loading');
      this.loading = false;
      return;
    }
    
    // Double-check authentication
    if (!this.authService.isLoggedIn()) {
      this.error = 'Authentication failed. Please try logging in again.';
      this.loading = false;
      return;
    }
    
    // Get authenticated headers
    const headers = this.authService.getAuthHeaders();
    
    // Determine which endpoint to call based on active tab
    const endpoint = this.activeTab;
    
    console.log(`Loading ${endpoint} messages with auth headers: ${headers ? 'Present' : 'Not present'}`);

    // Use alternate endpoints that are more likely to work
    let apiEndpoint = '';
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.error = 'User information not available';
      this.loading = false;
      return;
    }
    
    if (this.activeTab === 'inbox') {
      apiEndpoint = `${environment.apiUrl}/messages/received/${currentUser.id}`;
    } else {
      apiEndpoint = `${environment.apiUrl}/messages/sent/${currentUser.id}`;
    }
    
    console.log(`Using alternate endpoint: ${apiEndpoint}`);

    this.http.get<any>(apiEndpoint, { headers })
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.messages = Array.isArray(response.data) ? response.data : [];
            
            // Immediately fix any "Untitled Property" issues in all messages
            this.fixUntitledPropertyInMessages(this.messages);
            
            // Process all messages to extract property titles and load property details
            this.messages.forEach(message => {
              // Extract property title from content
              this.extractPropertyTitle(message);
              
              if (message.propertyId) {
                this.loadPropertyDetails(message);
              }
              
              // Load meetings for each message
              this.loadMeetingsForMessage(message);
            });
          } else {
            this.error = response?.message || 'Failed to load messages';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          
          // Handle different types of errors
          if (error.status === 401) {
            this.error = 'Authentication failed. Please try logging in again.';
            
            // Try to refresh the authentication state
            if (this.isBrowser) {
              // Attempt to reload the current user
              this.authService.refreshToken().subscribe({
                next: () => {
                  console.log('Token refreshed successfully, retrying message load');
                  setTimeout(() => this.loadMessages(), 1000);
                },
                error: () => console.error('Token refresh failed')
              });
            }
          } else if (error.status === 403) {
            this.error = 'You do not have permission to view these messages';
          } else if (error.status === 500) {
            this.error = 'The server encountered an error. Please try again later.';
            
            // Try a fallback approach for server error
            this.loadMessagesWithFallback();
          } else if (error.status === 0) {
            // Handle network errors and incomplete responses
            this.error = 'Network error occurred. The server may be unavailable.';
            
            // Try a fallback approach for network error
            this.loadMessagesWithFallback();
          } else {
            // Try to safely extract error message
            let errorMessage = 'Network error occurred. Please check your connection.';
            
            try {
              if (error.error && typeof error.error === 'object') {
                errorMessage = error.error.message || errorMessage;
              } else if (typeof error.error === 'string' && error.error.trim().startsWith('{')) {
                // Try to parse JSON string
                const errorObj = JSON.parse(error.error);
                errorMessage = errorObj.message || errorMessage;
              }
            } catch (e) {
              console.error('Error parsing error response:', e);
            }
            
            this.error = errorMessage;
          }
          
          this.loading = false;
          // Show empty array rather than previous results
          this.messages = [];
        }
      });
  }
  
  // Fallback method for loading messages using a more direct approach
  loadMessagesWithFallback(): void {
    if (!this.isBrowser) return;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('No current user available for fallback loading');
      return;
    }
    
    console.log('Attempting to load messages with fallback method');
    
    // Get authenticated headers
    const headers = this.authService.getAuthHeaders();
    
    // Use the direct endpoint with user ID
    const endpoint = this.activeTab === 'inbox' 
      ? `${environment.apiUrl}/messages/unread/${currentUser.id}` 
      : `${environment.apiUrl}/messages/sent/${currentUser.id}`;
    
    // Create a proper HttpContext instance
    const contextObj = new HttpContext();
    if (this.activeTab === 'sent') {
      contextObj.set(EXTENDED_TIMEOUT, true);
    }
    
    this.http.get<any>(endpoint, { 
      headers, 
      context: contextObj
    }).subscribe({
      next: (response: any) => {
        if (response && typeof response === 'object' && response.success) {
          this.messages = Array.isArray(response.data) ? response.data : [];
          this.error = null;
          console.log('Fallback message loading successful');
        } else {
          console.error('Unexpected response format:', response);
        }
      },
      error: (err) => {
        console.error('Fallback message loading also failed:', err);
      }
    });
  }
  
  loadPropertyDetails(message: any): void {
    // Check if we already have this property in cache
    if (this.propertiesCache[message.propertyId]) {
      message.property = this.propertiesCache[message.propertyId];
      
      // If we found a property but the subject still says "Untitled Property",
      // update the message subject to include the actual property title
      if (message.property && message.property.title && 
          message.subject && message.subject.includes('Untitled Property')) {
        message.betterSubject = message.subject.replace('Untitled Property', message.property.title);
        console.log('Replaced "Untitled Property" with:', message.property.title);
      }
      
      return;
    }
    
    // Get authenticated headers
    const headers = this.authService.getAuthHeaders();
    
    this.http.get<any>(`${environment.apiUrl}/listings/get/${message.propertyId}`, { headers }).subscribe({
      next: (response) => {
        if (response && response.success) {
          // Use PropertyService to standardize property
          const property = this.propertyService.standardizeProperty(response.data);
          
          // Ensure the property has a direct featuredImage property
          if (!property.featuredImage && property.images && property.images.length > 0) {
            property.featuredImage = property.images[0];
          }
          if (!property.featuredImage) {
            property.featuredImage = 'assets/images/prpty.jpg';
          }
          
          // Cache the property and assign to message
          this.propertiesCache[message.propertyId] = property;
          message.property = property;
          
          // If the subject still says "Untitled Property", update it with the actual property title
          if (property.title && message.subject && message.subject.includes('Untitled Property')) {
            message.betterSubject = message.subject.replace('Untitled Property', property.title);
            console.log('Replaced "Untitled Property" with:', property.title);
          }
        } else {
          console.warn(`Property ${message.propertyId} could not be loaded`, response);
          // Add a placeholder property to avoid repeated failed requests
          message.property = this.propertyService.standardizeProperty({
            title: `Property #${message.propertyId}`,
            images: ['assets/images/prpty.jpg']
          });
          
          // Ensure the fallback property has a direct featuredImage property
          message.property.featuredImage = 'assets/images/prpty.jpg';
        }
      },
      error: (error) => {
        console.error(`Error loading property ${message.propertyId} details:`, error);
        
        // Create a fallback property object and standardize it
        const fallbackProperty = this.propertyService.standardizeProperty({
          title: `Property #${message.propertyId}`,
          images: ['assets/images/prpty.jpg'],
          error: true
        });
        
        // Ensure the fallback property has a direct featuredImage property
        fallbackProperty.featuredImage = 'assets/images/prpty.jpg';
        
        // Store in cache to prevent repeated requests
        this.propertiesCache[message.propertyId] = fallbackProperty;
        message.property = fallbackProperty;
      }
    });
  }
  
  switchTab(tab: 'inbox' | 'sent'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.loadMessages();
    }
  }
  
  markAsRead(message: any): void {
    if (!message.read && this.activeTab === 'inbox') {
      // Get authenticated headers
      const headers = this.authService.getAuthHeaders();
      
      this.http.put<any>(`${environment.apiUrl}/messages/${message.id}/read`, {}, { headers }).subscribe({
        next: (response) => {
          if (response && response.success) {
            message.read = true;
          }
        },
        error: (error) => {
          console.error('Error marking message as read', error);
        }
      });
    }
  }
  
  deleteMessage(messageId: number, event: Event): void {
    event.stopPropagation(); // Prevent triggering the parent click event
    
    if (confirm('Are you sure you want to delete this message?')) {
      // Get authenticated headers
      const headers = this.authService.getAuthHeaders();
      
      this.http.delete<any>(`${environment.apiUrl}/messages/${messageId}`, { headers }).subscribe({
        next: (response) => {
          if (response && response.success) {
            // Remove the message from the list
            this.messages = this.messages.filter(m => m.id !== messageId);
          }
        },
        error: (error) => {
          console.error('Error deleting message', error);
          alert('Failed to delete message: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }
  
  viewProperty(propertyId: number): void {
    this.router.navigate(['/properties', propertyId]);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  // Open the reply modal with the selected message
  openReplyModal(message: any, event: Event): void {
    event.stopPropagation(); // Prevent triggering the parent click event (which would mark as read)
    
    this.selectedMessage = message;
    this.replySuccess = false;
    this.replyError = null;
    
    // Mark the message as read if it's not already
    this.markAsRead(message);
    
    // Set the subject with RE: prefix if not already present
    let subject = message.subject || `RE: Property Inquiry`;
    if (!subject.startsWith('RE:') && !subject.startsWith('Re:')) {
      subject = `RE: ${subject}`;
    }
    
    // Update form with defaults
    this.replyForm.patchValue({
      subject: subject
    });
    
    // Only show modal in browser environment
    if (this.isBrowser && this.replyModal) {
      this.replyModal.show();
    }
  }
  
  // Send the reply message
  sendReply(): void {
    if (!this.replyForm || this.replyForm.invalid || !this.selectedMessage) {
      console.log('Cannot send reply: Form invalid or incomplete', {
        formExists: !!this.replyForm,
        formValid: this.replyForm?.valid,
        selectedMessage: !!this.selectedMessage
      });
      return;
    }
    
    this.replySending = true;
    this.replyError = null;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.replyError = 'You must be logged in to send messages';
      this.replySending = false;
      return;
    }
    
    // Create the reply payload
    const replyData = {
      senderId: currentUser.id,
      recipientId: this.selectedMessage.senderId,
      propertyId: this.selectedMessage.propertyId,
      subject: this.replyForm.value.subject,
      message: this.replyForm.value.message
    };
    
    // Get authenticated headers
    const headers = this.authService.getAuthHeaders();
    
    // Send the reply to the backend
    this.http.post<any>(`${environment.apiUrl}/messages/send`, replyData, { headers }).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.replySuccess = true;
          // Reset the form after successful send
          this.replyForm.reset({
            subject: 'RE: Property Inquiry'
          });
          
          // Close the modal after a short delay
          setTimeout(() => {
            if (this.isBrowser && this.replyModal) {
              this.replyModal.hide();
            }
            // Reload the messages to include the new reply in sent items
            this.loadMessages();
          }, 2000);
        } else {
          this.replyError = response?.message || 'Failed to send reply';
        }
        this.replySending = false;
      },
      error: (error) => {
        console.error('Error sending reply:', error);
        
        // Similar error handling as loadMessages
        if (error.status === 401) {
          this.replyError = 'You must be logged in to send messages';
        } else if (error.status === 403) {
          this.replyError = 'You do not have permission to send messages';
        } else if (error.status === 500) {
          this.replyError = 'The server encountered an error. Please try again later.';
        } else {
          let errorMessage = 'An error occurred while sending your reply';
          
          try {
            if (error.error && typeof error.error === 'object') {
              errorMessage = error.error.message || errorMessage;
            } else if (typeof error.error === 'string' && error.error.trim().startsWith('{')) {
              const errorObj = JSON.parse(error.error);
              errorMessage = errorObj.message || errorMessage;
            }
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          
          this.replyError = errorMessage;
        }
        
        this.replySending = false;
      }
    });
  }
  
  // Load meetings for a message
  loadMeetingsForMessage(message: any): void {
    if (!message.id) return;
    
    this.meetingService.getMeetingsByMessageId(message.id).subscribe({
      next: (response) => {
        if (response.success) {
          message.meetings = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error loading meetings for message:', error);
      }
    });

    // Extract and store property title if available in the message content
    this.extractPropertyTitle(message);
  }
  
  // Extract property title from various message formats
  extractPropertyTitle(message: any): void {
    if (!message) return;
    
    // Log the full message structure to identify the source of "Untitled Property"
    console.log('Full message structure:', JSON.stringify(message, null, 2));
    
    // Skip if we already have a property title
    if (message.extractedPropertyTitle) return;
    
    let propertyTitle = null;
    
    // Log all possible places where a property title might be found
    console.log('Potential property title sources:');
    console.log('- message.subject:', message.subject);
    console.log('- message.propertyName:', message.propertyName);
    if (message.property) {
      console.log('- message.property.title:', message.property?.title);
      console.log('- message.property.name:', message.property?.name);
    }
    console.log('- message.messageText:', message.messageText?.substring(0, 100));
    console.log('- message.content:', message.content?.substring(0, 100));
    
    // Try to find property title in message content
    if (message.messageText && message.messageText.includes('Inquiry about property:')) {
      const match = message.messageText.match(/Inquiry about property:\s*([^\n]+)/i);
      if (match && match[1]) {
        propertyTitle = match[1].trim();
      }
    } else if (message.content && message.content.includes('Inquiry about property:')) {
      const match = message.content.match(/Inquiry about property:\s*([^\n]+)/i);
      if (match && match[1]) {
        propertyTitle = match[1].trim();
      }
    }
    
    // Check if "Untitled Property" is in the subject field and try to extract the real property name
    if (message.subject && message.subject.includes('Untitled Property')) {
      console.log('Found "Untitled Property" in subject:', message.subject);
      
      // Try to get a better property title from the message itself
      if (message.messageText && message.messageText.includes('property:')) {
        const match = message.messageText.match(/property:\s*([^\n]+)/i);
        if (match && match[1]) {
          propertyTitle = match[1].trim();
          console.log('Extracted property title from messageText:', propertyTitle);
        }
      } else if (message.content && message.content.includes('property:')) {
        const match = message.content.match(/property:\s*([^\n]+)/i);
        if (match && match[1]) {
          propertyTitle = match[1].trim();
          console.log('Extracted property title from content:', propertyTitle);
        }
      }
    }
    
    // Store the extracted title on the message object for future reference
    if (propertyTitle) {
      message.extractedPropertyTitle = propertyTitle;
      console.log(`Extracted property title from message: "${propertyTitle}"`);
    } else {
      console.log('Failed to extract property title from message');
    }
  }
  
  // Helper method to determine the best property title
  getBestPropertyTitle(message: any): string {
    // Try different sources for property title in priority order
    if (message.propertyName) {
      return message.propertyName;
    } else if (message.extractedPropertyTitle) {
      return message.extractedPropertyTitle;
    } else if (message.property && message.property.title) {
      return message.property.title;
    } else if (message.betterSubject && !message.betterSubject.includes('Untitled Property')) {
      const subjectMatch = message.betterSubject.match(/Property Inquiry (.+)$/);
      if (subjectMatch && subjectMatch[1]) {
        return subjectMatch[1].trim();
      }
    } else if (message.messageText && message.messageText.includes('Inquiry about property:')) {
      const match = message.messageText.match(/Inquiry about property:\s*([^\n]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    } else if (message.content && message.content.includes('Inquiry about property:')) {
      const match = message.content.match(/Inquiry about property:\s*([^\n]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If nothing else works
    return message.property ? `Property #${message.propertyId}` : '';
  }
  
  // Open the schedule meeting modal
  openScheduleMeetingModal(message: any, event: Event): void {
    event.stopPropagation(); // Prevent triggering the parent click event
    
    // Update the selected message
    this.selectedMessage = message;
    this.meetingSuccess = false;
    this.meetingError = null;
    
    // Mark the message as read if it's not already
    this.markAsRead(message);
    
    // Reset the form with a simple, clear title that users can easily change
    const today = new Date();
    today.setHours(today.getHours() + 1);
    
    // Set a simple default title - users will customize it based on their needs
    this.meetingForm.reset({
      title: 'Property Discussion', // Simple, generic title that users will change
      description: '',
      meetingTime: today.toISOString().slice(0, 16),
      durationMinutes: 30,
      location: '',
      meetingLink: ''
    });
    
    // Only show modal in browser environment
    if (this.isBrowser && this.meetingModal) {
      this.meetingModal.show();
    }
  }
  
  // Schedule a meeting
  scheduleMeeting(): void {
    if (!this.meetingForm.valid || !this.selectedMessage) {
      return;
    }
    
    this.meetingScheduling = true;
    this.meetingError = null;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.meetingError = 'You must be logged in to schedule meetings';
      this.meetingScheduling = false;
      return;
    }
    
    // Determine the other user - this should be consistent regardless of which tab we're in
    // If the current user is the sender, the participant is the recipient, and vice versa
    let otherUserId;
    if (this.selectedMessage.senderId === currentUser.id) {
      otherUserId = this.selectedMessage.recipientId;
    } else {
      otherUserId = this.selectedMessage.senderId;
    }
    
    if (!otherUserId) {
      this.meetingError = 'Cannot determine the other participant';
      this.meetingScheduling = false;
      return;
    }
    
    // Get form values directly - respect user input
    const formValue = this.meetingForm.value;
    
    // Debug: Log propertyId from selectedMessage
    console.log('Selected message propertyId:', this.selectedMessage.propertyId);
    
    // Ensure we have a propertyId - this must not be null
    const propertyId = this.selectedMessage.propertyId;
    if (!propertyId) {
      this.meetingError = 'Property ID is required for scheduling a meeting';
      this.meetingScheduling = false;
      return;
    }
    
    // Create the meeting request
    const meetingRequest = {
      participantId: otherUserId,
      title: formValue.title,
      description: formValue.description,
      meetingTime: new Date(formValue.meetingTime).toISOString(),
      durationMinutes: formValue.durationMinutes,
      location: formValue.location || null, // Ensure null instead of empty string
      meetingLink: formValue.meetingLink || null, // Ensure null instead of empty string
      propertyId: propertyId, // Use the explicitly checked propertyId
      messageId: this.selectedMessage.id
    };
    
    console.log('Meeting request:', meetingRequest);
    
    this.meetingService.createMeeting(meetingRequest).subscribe({
      next: (response) => {
        this.meetingScheduling = false;
        
        if (response.success && response.data) {
          this.meetingSuccess = true;
          
          // Add the new meeting to the message's meetings array
          if (!this.selectedMessage.meetings) {
            this.selectedMessage.meetings = [];
          }
          this.selectedMessage.meetings.push(response.data);
          
          // Close the modal after a short delay
          setTimeout(() => {
            if (this.meetingModal) {
              this.meetingModal.hide();
            }
          }, 2000);
        } else {
          this.meetingError = response.message || 'Failed to schedule meeting';
        }
      },
      error: (error) => {
        this.meetingScheduling = false;
        console.error('Error scheduling meeting:', error);
        if (error.error && error.error.message) {
          this.meetingError = 'Error: ' + error.error.message;
        } else {
          this.meetingError = 'Error scheduling meeting. Please try again.';
        }
      }
    });
  }
  
  // Meeting status helpers
  getMeetingStatusLabel(status: string): string {
    return this.meetingService.getStatusLabel(status as MeetingStatus);
  }
  
  getMeetingStatusColor(status: string): string {
    return this.meetingService.getStatusColor(status as MeetingStatus);
  }
  
  formatMeetingTime(meeting: any): string {
    return this.meetingService.formatMeetingTime(meeting);
  }
  
  // Meeting action checks based on status and user role
  canAcceptMeeting(meeting: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) return false;
    
    // Check if the current user is the participant (the one who needs to accept/decline)
    return meeting.participantId === currentUser.id && 
           meeting.status === MeetingStatus.PENDING;
  }
  
  canDeclineMeeting(meeting: any): boolean {
    return this.canAcceptMeeting(meeting);
  }
  
  canCancelMeeting(meeting: any): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) return false;
    
    // Only the creator of the meeting can cancel it, and only if it's pending or accepted
    return meeting.creatorId === currentUser.id && 
           (meeting.status === MeetingStatus.PENDING || meeting.status === MeetingStatus.ACCEPTED);
  }
  
  // Meeting actions
  acceptMeeting(meetingId: number, event: Event): void {
    event.stopPropagation();
    
    this.meetingService.acceptMeeting(meetingId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the meeting in the UI
          this.updateMeetingInList(response.data);
          
          // Provide feedback to the user
          this.notificationService.success('Meeting accepted successfully!');
        } else {
          this.notificationService.error(response.message || 'Failed to accept meeting');
        }
      },
      error: (error) => {
        console.error('Error accepting meeting:', error);
        this.notificationService.error('Error accepting meeting. Please try again.');
      }
    });
  }
  
  declineMeeting(meetingId: number, event: Event): void {
    event.stopPropagation();
    
    this.meetingService.declineMeeting(meetingId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the meeting in the UI
          this.updateMeetingInList(response.data);
        }
      },
      error: (error) => {
        console.error('Error declining meeting:', error);
      }
    });
  }
  
  cancelMeeting(meetingId: number, event: Event): void {
    event.stopPropagation();
    
    this.meetingService.cancelMeeting(meetingId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update the meeting in the UI
          this.updateMeetingInList(response.data);
        }
      },
      error: (error) => {
        console.error('Error cancelling meeting:', error);
      }
    });
  }
  
  private updateMeetingInList(updatedMeeting: Meeting): void {
    // Find the message that contains this meeting
    for (const message of this.messages) {
      if (message.meetings && message.meetings.length > 0) {
        const meetingIndex = message.meetings.findIndex((m: any) => m.id === updatedMeeting.id);
        if (meetingIndex !== -1) {
          // Update the meeting in the array
          message.meetings[meetingIndex] = updatedMeeting;
          
          // If meeting is accepted and it's in a message context, navigate to meetings page
          if (updatedMeeting.status === MeetingStatus.ACCEPTED) {
            // Show a notification that the meeting has been accepted and will appear in meetings page
            this.notificationService.success('Meeting accepted! You can view it in your Meetings page.');
            
            // Optional: Navigate to the meetings page after a short delay
            // setTimeout(() => this.router.navigate(['/meetings']), 2000);
          }
          
          break;
        }
      }
    }
  }
  
  /**
   * Directly fix any "Untitled Property" issues in messages
   */
  fixUntitledPropertyInMessages(messages: any[]): void {
    if (!messages || !Array.isArray(messages)) return;
    
    console.log('Fixing Untitled Property in', messages.length, 'messages');
    
    for (const message of messages) {
      // Skip if no subject
      if (!message.subject) continue;
      
      // Check if the subject contains "Untitled Property"
      if (message.subject.includes('Untitled Property')) {
        console.log('Found message with Untitled Property in subject:', message.subject);
        console.log('Message structure:', message);
        
        // First, check if we have a propertyName directly in the message
        let realPropertyTitle = message.propertyName;
        
        if (!realPropertyTitle) {
          // Try to extract from content or messageText
          const contentToCheck = message.messageText || message.content || '';
          const lines = contentToCheck.split('\n');
          
          for (const line of lines) {
            if (line.includes('Inquiry about property:')) {
              const match = line.match(/Inquiry about property:\s*(.+)/i);
              if (match && match[1]) {
                realPropertyTitle = match[1].trim();
                console.log('Found property title in line:', line);
                console.log('Extracted title:', realPropertyTitle);
                break;
              }
            }
          }
          
          // First check messageText - the main content field
          if (!realPropertyTitle && message.messageText && message.messageText.includes('Inquiry about property:')) {
            const match = message.messageText.match(/Inquiry about property:\s*([^\n]+)/i);
            if (match && match[1]) {
              realPropertyTitle = match[1].trim();
              console.log('Extracted title from messageText:', realPropertyTitle);
            }
          }
          
          // Then check content field - alternative content field
          if (!realPropertyTitle && message.content && message.content.includes('Inquiry about property:')) {
            const match = message.content.match(/Inquiry about property:\s*([^\n]+)/i);
            if (match && match[1]) {
              realPropertyTitle = match[1].trim();
              console.log('Extracted title from content:', realPropertyTitle);
            }
          }
        } else {
          console.log('Using propertyName as real title:', realPropertyTitle);
        }
        
        // If we found a real title, directly update the message subject
        if (realPropertyTitle) {
          const oldSubject = message.subject;
          message.subject = message.subject.replace('Untitled Property', realPropertyTitle);
          message.fixedTitle = realPropertyTitle;
          console.log('Directly replaced "Untitled Property" with real title in subject:',
                     'Old:', oldSubject, 'New:', message.subject);
        }
      }
    }
  }
} 