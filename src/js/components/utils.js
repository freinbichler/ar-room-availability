import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { setAttributes } from '../utils';

window.moment = extendMoment(Moment);

export function createMarker(value) {
  const marker = document.createElement('a-marker');
  setAttributes(marker, {
    type: 'barcode',
    value,
  });
  return marker;
}

export function createText(isFree) {
  const text = document.createElement('a-text');
  setAttributes(text, {
    value: isFree ? 'free' : 'not free',
    position: '-0.5 0 -1',
    rotation: '-90 0 0',
    color: isFree ? '#7BC8A4' : '#f60',
  });
  return text;
}

export function createBox({ position, depth, width, height, color }) {
  const box = document.createElement('a-box');
  setAttributes(box, { position, depth, width, height, color });
  return box;
}

export function createFrame(isFree) {
  const boxes = [];
  boxes.push(createBox({ position: '-0.5 0 0', depth: '1.2', width: '0.1', height: '0.1', color: isFree ? '#7BC8A4' : '#f60' }));
  boxes.push(createBox({ position: '0.5 0 0', depth: '1.2', width: '0.1', height: '0.1', color: isFree ? '#7BC8A4' : '#f60' }));
  boxes.push(createBox({ position: '0 0 0.5', depth: '0.1', width: '1.2', height: '0.1', color: isFree ? '#7BC8A4' : '#f60' }));
  boxes.push(createBox({ position: '0 0 -0.5', depth: '0.1', width: '1.2', height: '0.1', color: isFree ? '#7BC8A4' : '#f60' }));
  return boxes;
}

export function calculateAvailability(roomActivities) {
  const now = window.moment();
  let free = true;

  roomActivities.map((activity, i) => {
    if (now.isBetween(activity.begin, activity.end)) {
      free = false;
    } else if (i < roomActivities.length - 1) {
      const nextActivity = roomActivities[i + 1];
      const range = window.moment.range(
        window.moment(activity.end),
        window.moment(nextActivity.begin),
      );
      if (now.isBetween(activity.end, nextActivity.begin) && range.diff('minutes') <= 15) {
        free = false;
      }
    }
  });

  return free;
}
