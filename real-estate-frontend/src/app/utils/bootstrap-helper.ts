import { isPlatformBrowser } from '@angular/common';

/**
 * Utility to safely load Bootstrap components in SSR environment
 */
export class BootstrapHelper {
  /**
   * Dynamically imports and creates a Bootstrap Modal instance
   * @param element The DOM element to create the modal from
   * @param isBrowser Boolean indicating if we're in a browser environment
   * @returns Promise resolving to the Modal instance or null if not in browser
   */
  static async createModal(element: HTMLElement | null, isBrowser: boolean): Promise<any | null> {
    if (!isBrowser || !element) {
      return null;
    }

    try {
      const bootstrap = await import('bootstrap');
      return new bootstrap.Modal(element);
    } catch (error) {
      console.error('Error loading Bootstrap Modal:', error);
      return null;
    }
  }

  /**
   * Safely loads and initializes Bootstrap tooltips on given elements
   * @param elements Array of elements to apply tooltips to
   * @param isBrowser Boolean indicating if we're in a browser environment
   */
  static async initTooltips(elements: HTMLElement[], isBrowser: boolean): Promise<void> {
    if (!isBrowser || !elements.length) {
      return;
    }

    try {
      const bootstrap = await import('bootstrap');
      elements.forEach(el => {
        new bootstrap.Tooltip(el);
      });
    } catch (error) {
      console.error('Error initializing Bootstrap tooltips:', error);
    }
  }

  /**
   * Safely initializes Bootstrap popovers
   * @param elements Array of elements to apply popovers to
   * @param isBrowser Boolean indicating if we're in a browser environment
   */
  static async initPopovers(elements: HTMLElement[], isBrowser: boolean): Promise<void> {
    if (!isBrowser || !elements.length) {
      return;
    }

    try {
      const bootstrap = await import('bootstrap');
      elements.forEach(el => {
        new bootstrap.Popover(el);
      });
    } catch (error) {
      console.error('Error initializing Bootstrap popovers:', error);
    }
  }
  
  /**
   * Safely initializes all Bootstrap components that rely on JavaScript
   * Call this method in components with multiple Bootstrap components
   * @param isBrowser Boolean indicating if we're in a browser environment
   */
  static async initAllComponents(isBrowser: boolean): Promise<void> {
    if (!isBrowser) {
      return;
    }
    
    try {
      const bootstrap = await import('bootstrap');
      
      // Initialize tooltips
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(el => {
        new bootstrap.Tooltip(el);
      });
      
      // Initialize popovers
      const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
      popoverTriggerList.forEach(el => {
        new bootstrap.Popover(el);
      });
      
      // Initialize dropdown
      const dropdownTriggerList = document.querySelectorAll('[data-bs-toggle="dropdown"]');
      dropdownTriggerList.forEach(el => {
        new bootstrap.Dropdown(el);
      });
      
      // Add more component initializations as needed
      
    } catch (error) {
      console.error('Error initializing Bootstrap components:', error);
    }
  }
} 