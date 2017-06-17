import {
  createMarker,
  createText,
  createFrame,
  calculateAvailability,
} from './utils';

export default class Roomplan {
  constructor() {
    this.scene = document.querySelector('#a-scene');

    this.load().then((m) => {
      this.markerActivities = m;
      this.init();
    });
  }

  init() {
    const markers = this.markerActivities;
    console.log(markers);

    Object.keys(markers).forEach((key) => {
      const marker = createMarker(key);

      const isFree = calculateAvailability(markers[key]);
      const text = createText(isFree);
      const frame = createFrame(isFree);
      frame.map(box => (marker.appendChild(box)));
      marker.appendChild(text);
      this.scene.appendChild(marker);
    });
  }

  async load() {
    const response = await fetch('https://freinbichler.me/apps/ar-room-backend/');
    return response.json();
  }
}
