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

export function createText({ text, color = '#000', position = '-2 0 -3', size = 4, align = 'center', id }) {
  const textObject = document.createElement('a-text');
  setAttributes(textObject, {
    id,
    value: text,
    width: size,
    font: 'aileronsemibold',
    'wrap-count': 20,
    rotation: '-90 0 0',
    align,
    position,
    color,
  });
  return textObject;
}

export function createBox({ position, depth, width, height, color, id }) {
  const box = document.createElement('a-box');
  setAttributes(box, { position, depth, width, height, color, id });
  return box;
}

export function createBadge({ position, src }) {
  const badge = document.createElement('a-image');
  setAttributes(badge, { position, src, rotation: '-90 0 0', width: 0.5, height: 0.5 });
  return badge;
}

export function createFrame(isFree) {
  const boxes = [];
  const color = isFree ? '#30E8BF' : '#c0392b';
  boxes.push(createBox({ position: '-0.8 0 -1.05', depth: '4', width: '0.3', height: '0.3111', color, id: 'frame' }));
  boxes.push(createBox({ position: '1.05 0 1.4', depth: '1.5', width: '4', height: '0.3112', color, id: 'frame' }));
  boxes.push(createBox({ position: '2.9 0 -1.05', depth: '4', width: '0.3', height: '0.3111', color, id: 'frame' }));
  boxes.push(createBox({ position: '1.05 0 -2.9', depth: '0.3', width: '4', height: '0.3112', color, id: 'frame' }));
  return boxes;
}

export function calculateAvailabilityDuration(free, roomActivities, index) {
  let duration = 'all day';
  const now = window.moment();

  if (free) {
    // if room is currently free, calculate time until next activity
    if (roomActivities.length > 0) {
      // time to next activity
      for (const activity of roomActivities) {
        if (now.isBefore(activity.begin)) {
          duration = window.moment.range(
            now,
            window.moment(activity.begin),
          );
          break;
        }
      }
    }
  } else {
    // if room is currently occupied, calculate time until the room is free again (for > 15 minutes)
    const currentActivity = roomActivities[index];
    if (index < roomActivities.length - 1) {
      for (let i = index; i < roomActivities.length - 1; i++) {
        const range = window.moment.range(
          window.moment(roomActivities[i].end),
          window.moment(roomActivities[i + 1].begin),
        );
        if (range.diff('minutes') > 15) {
          // time until end of activity block (including breaks)
          duration = window.moment.range(
            now,
            window.moment(roomActivities[i].end),
          );
          break;
        } else if (i === roomActivities.length - 2) {
          // time until last activity of the day ends if end day ends with activity block
          duration = window.moment.range(
            now,
            window.moment(roomActivities[i + 1].end),
          );
        }
      }
    } else {
      duration = window.moment.range(
        now,
        window.moment(currentActivity.end),
      );
    }
  }

  const humanizedDuration = (typeof duration === 'string') ? duration : humanizeDuration(duration + 0, { units: ['h', 'm'], round: true });
  return { duration, humanizedDuration };
}

export function calculateAvailability(roomActivities) {
  const now = window.moment();
  // const now = window.moment('2017-06-19 08:30:00');
  let free = true;
  let index = -1;
  roomActivities.map((activity, i) => { // eslint-disable-line
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

  return { free, duration };
}

export async function loadJSON(url) {
  const response = await fetch(url);
  return response.json();
}
