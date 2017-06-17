import {
  createMarker,
  createText,
  createFrame,
  calculateAvailability,
  loadJSON,
} from './utils';

export default class Roomplan {
  constructor() {
    this.scene = document.querySelector('#a-scene');
    this.markers = [];

    // load the marker from the server
    const response = loadJSON('https://freinbichler.me/apps/ar-room-backend/');
    response.then((m) => {
      this.markerActivities = m;
      this.init();
    });
  }

  init() {
    const markers = this.markerActivities;
    console.log(markers);

    Object.keys(markers).forEach((key) => {
      const marker = createMarker(key);

      const availability = calculateAvailability(markers[key]);
      const text = createText(availability);
      const frame = createFrame(availability);
      frame.map(box => (marker.appendChild(box)));
      marker.appendChild(text);
      this.scene.appendChild(marker);
      this.markers.push(marker);
    });

    // refresh every minute
    this.refresh();
  }

  stopRefresh() {
    clearInterval(this.timer);
  }

  refresh() {
    this.timer = setInterval(() => {
      this.markers.map((marker) => {
        const text = marker.querySelector('a-text');
        const key = marker.getAttribute('value');
        const availability = calculateAvailability(this.markerActivities[key]);

        text.setAttribute('value', availability);
      });
    // }, 60000);
    }, 2000);
  }

}
