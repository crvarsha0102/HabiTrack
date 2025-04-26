export interface Meeting {
  id?: number;
  creatorId: number;
  creatorName: string;
  participantId: number;
  participantName: string;
  title: string;
  description?: string;
  meetingTime: string | Date;
  durationMinutes: number;
  location?: string;
  meetingLink?: string;
  propertyId?: number;
  propertyName?: string;
  propertyImageUrl?: string;
  messageId?: number;
  status: MeetingStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MeetingRequest {
  participantId: number;
  title: string;
  description?: string;
  meetingTime: string | Date;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  propertyId?: number;
  messageId?: number;
}

export enum MeetingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
} 