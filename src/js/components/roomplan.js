import { setAttributes } from '../utils';
import {
  createMarker,
  createText,
  createFrame,
  createBox,
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

      // logic for each room
      const { free, duration } = calculateAvailability(markers[key]);
      const textForObject = this.getText({ free, duration });

      // a frame objects
      const text = createText(Object.assign({ position: '-3 0 -2.5' }, textForObject));
      const frame = createFrame(free);
      frame.map(box => (marker.appendChild(box)));
      marker.appendChild(text);

      // append to scene and save markers to edit on refresh
      this.scene.appendChild(marker);
      this.markers.push(marker);
    });

    // refresh every minute
    this.refresh();
  }

  getText({ free, duration }) {
    const freeText = free ? `FREE:\n ${duration.humanizedDuration}` : 'NOT FREE: \n';
    const color = free ? '#30E8BF' : '#c0392b';
    return { text: freeText, color };
  }

  stopRefresh() {
    clearInterval(this.timer);
  }

  refresh() {
    this.timer = setInterval(() => {
      this.markers.map((marker) => {
        const text = marker.querySelector('a-text');
        const key = marker.getAttribute('value');
        const { free, duration } = calculateAvailability(this.markerActivities[key]);
        const newText = this.getText({ free, duration });
        text.setAttribute('value', newText.text); // TODO: fix this to set text correctly
        text.setAttribute('color', newText.color); // TODO: fix this to set text correctly
      });
    }, 30000);
    // }, 2000);
  }

}
