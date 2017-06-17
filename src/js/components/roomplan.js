import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { setAttributes } from '../utils';
import Activity from './activity';

export default class Roomplan {
  constructor() {
    window.moment = extendMoment(Moment);
    this.scene = document.querySelector('#a-scene');

    this.load().then((m) => {
      this.markerActivities = m;
      this.init();
    });
  }

  init() {
    const markers = this.markerActivities;
    console.log(markers);
    for (const property in markers) {
      if (markers.hasOwnProperty(property)) {
        const marker = this.createMarker(property);

        const text = this.createText();
        const frame = this.createFrame();
        for (const box of frame) {
          marker.appendChild(box);
        }
        marker.appendChild(text);
        this.scene.appendChild(marker);
      }
    }

  createMarker(value) {
    const marker = document.createElement('a-marker');
    setAttributes(marker, {
      type: 'barcode',
      value,
    });
    return marker;
  }

  createText() {
    const text = document.createElement('a-text');
    setAttributes(text, {
      value: 'test',
      position: '-1 0 -1',
      rotation: '-90 0 0',
      color: '#f60',
    });
    return text;
  }

  createFrame() {
    const boxes = [];
    boxes.push(this.createBox({ position: '-0.5 0 0', depth: '1.2', width: '0.1', height: '0.1', color: '#7BC8A4' }));
    boxes.push(this.createBox({ position: '0.5 0 0', depth: '1.2', width: '0.1', height: '0.1', color: '#7BC8A4' }));
    boxes.push(this.createBox({ position: '0 0 0.5', depth: '0.1', width: '1.2', height: '0.1', color: '#7BC8A4' }));
    boxes.push(this.createBox({ position: '0 0 -0.5', depth: '0.1', width: '1.2', height: '0.1', color: '#7BC8A4' }));
    return boxes;
  }

  createBox({ position, depth, width, height, color }) {
    const box = document.createElement('a-box');
    setAttributes(box, {
      position,
      depth,
      width,
      height,
      color,
    });
    return box;
  }

  async load() {
    const response = await fetch('https://freinbichler.me/apps/ar-room-backend/');
    return await response.json();
  }
}
