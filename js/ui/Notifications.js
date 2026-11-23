import { eventBus } from '../core/EventBus.js';

/**
 * Displays toast notifications in the top-right stack.
 */
export class Notifications {
  constructor(container) {
    this.container = container;
    eventBus.on('ui:notify', (msg) => this.show(msg));
  }

  show(message, duration = 3200) {
    if (!this.container) return;
    const el = document.createElement('div');
    el.className = 'toast-msg anim-slide-in';
    el.textContent = message;
    this.container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }
}
