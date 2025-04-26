import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Simple notification using native browser API
  success(message: string, title: string = 'Success'): void {
    if (this.isBrowser) {
      console.log(`[Success]: ${title} - ${message}`);
      // Optional: Use a temporary floating div for notifications
      this.showNotification(message, 'success');
    } else {
      console.log(`[Success]: ${title} - ${message}`);
    }
  }

  error(message: string, title: string = 'Error'): void {
    if (this.isBrowser) {
      console.error(`[Error]: ${title} - ${message}`);
      this.showNotification(message, 'error');
    } else {
      console.error(`[Error]: ${title} - ${message}`);
    }
  }

  info(message: string, title: string = 'Info'): void {
    if (this.isBrowser) {
      console.log(`[Info]: ${title} - ${message}`);
      this.showNotification(message, 'info');
    } else {
      console.log(`[Info]: ${title} - ${message}`);
    }
  }

  warning(message: string, title: string = 'Warning'): void {
    if (this.isBrowser) {
      console.warn(`[Warning]: ${title} - ${message}`);
      this.showNotification(message, 'warning');
    } else {
      console.warn(`[Warning]: ${title} - ${message}`);
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    if (!this.isBrowser) return;

    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    
    // Set color based on type
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#4caf50';
        notification.style.color = 'white';
        break;
      case 'error':
        notification.style.backgroundColor = '#f44336';
        notification.style.color = 'white';
        break;
      case 'info':
        notification.style.backgroundColor = '#2196f3';
        notification.style.color = 'white';
        break;
      case 'warning':
        notification.style.backgroundColor = '#ff9800';
        notification.style.color = 'white';
        break;
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
} 