import Moment from 'moment';
import { extendMoment } from 'moment-range';
import humanizeDuration from 'humanize-duration';
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

export function createText({ text, color, position }) {
  const textObject = document.createElement('a-text');
  setAttributes(textObject, {
    value: text,
    position: '-0.5 0 -1',
    rotation: '-90 0 0',
    color,
  });
  return textObject;
}

export function createBox({ position, depth, width, height, color, opacity }) {
  const box = document.createElement('a-box');
  setAttributes(box, { position, depth, width, height, color, opacity });
  return box;
}

export function createFrame(isFree) {
  const boxes = [];
  const color = isFree ? 'green' : '#f60';
  boxes.push(createBox({ position: '-0.8 0 -1.5', depth: '6', width: '0.3', height: '0.3', color }));
  boxes.push(createBox({ position: '1.5 0 0.8', depth: '0.3', width: '6', height: '0.3', color }));
  boxes.push(createBox({ position: '4 0 -1.5', depth: '6', width: '0.3', height: '0.3', color }));
  boxes.push(createBox({ position: '1.5 0 -4', depth: '0.3', width: '6', height: '0.3', color }));
  return boxes;
}

export function calculateAvailabilityDuration(free, roomActivities, index) {
  console.log(free);
  console.log(roomActivities);
  console.log(index);
  let duration;
  if (free) {
    if (roomActivities.length - 1 > index) {
      // time to next activity
      duration = window.moment.range(
        window.moment(),
        window.moment(roomActivities[index + 1].begin),
      );
    } else {
      // no activities left today
      duration = 'all day';
    }
  } else {
    // TODO: wenn besetzt
  }

  const humanizedDuration = (typeof duration === 'string') ? 'all day' : humanizeDuration(duration + 0, { units: ['h', 'm'], round: true });
  return { duration, humanizedDuration };
}

export function calculateAvailability(roomActivities) {
  const now = window.moment();
  let free = true;
  let index = -1;

  roomActivities.map((activity, i) => {
    if (free) {
      // check if now is withing an activity
      if (now.isBetween(activity.begin, activity.end)) {
        free = false;
        index = i;
      } else if (i < roomActivities.length - 1) {
        // get the next activity and range to current activity
        const nextActivity = roomActivities[i + 1];
        const range = window.moment.range(
          window.moment(activity.end),
          window.moment(nextActivity.begin),
        );

        // check if there is a break
        if (now.isBetween(activity.end, nextActivity.begin) && range.diff('minutes') <= 15) {
          free = false;
          index = i;
        }
      }
    }
  });

  const duration = calculateAvailabilityDuration(free, roomActivities, index);
  console.log(duration);

  return { free, duration };
}

export async function loadJSON(url) {
  const response = await fetch(url);
  return response.json();
}
