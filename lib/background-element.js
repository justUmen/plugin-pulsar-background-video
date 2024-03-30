'use babel';

let VideoPlayerElement = require('./video-element');

class VideoPlayerBackgroundElement extends HTMLElement {
  constructor() {
    super(); // Always call super first in constructor
    this.videoPlayer = new VideoPlayerElement();
  }

  connectedCallback() {
    // This method is called when your element is inserted into the DOM
    const activePane = atom.workspace.getActivePane();
    const platformLinuxElement = activePane.getElement().querySelector('.item-views');

    if (platformLinuxElement) {
      console.log(".item-views element is available");
      platformLinuxElement.appendChild(this);
      this.attachShadow({ mode: 'open' }).appendChild(this.videoPlayer);
    } else {
      console.log(".item-views element not found, waiting for changes...");
      const observer = new MutationObserver(() => {
        const updatedPlatformLinuxElement = activePane.getElement().querySelector('.item-views');
        if (updatedPlatformLinuxElement) {
          observer.disconnect(); // Stop observing
          console.log(".item-views element is now available");
          updatedPlatformLinuxElement.appendChild(this);
          if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
          }
          this.shadowRoot.appendChild(this.videoPlayer);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
}

customElements.define('video-player-background', VideoPlayerBackgroundElement);

export default VideoPlayerBackgroundElement;
