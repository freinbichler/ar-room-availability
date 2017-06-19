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

export function createText({ text, color = '#000', position = '-2 0 -3' }) {
  const textObject = document.createElement('a-text');
  setAttributes(textObject, {
    value: text,
    width: 4,
    font: 'aileronsemibold',
    'wrap-count': 20,
    rotation: '-90 0 0',
    position,
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
  const color = isFree ? '#30E8BF' : '#c0392b';
  boxes.push(createBox({ position: '-0.8 0 -1.05', depth: '4', width: '0.3', height: '0.3', color }));
  boxes.push(createBox({ position: '1.05 0 0.8', depth: '0.3', width: '4', height: '0.3', color }));
  boxes.push(createBox({ position: '2.9 0 -1.05', depth: '4', width: '0.3', height: '0.3', color }));
  boxes.push(createBox({ position: '1.05 0 -2.9', depth: '0.3', width: '4', height: '0.3', color }));
  return boxes;
}

export function calculateAvailabilityDuration(free, roomActivities, index) {
  console.log(free);
  console.log(roomActivities);
  console.log(index);
  let duration = 'all day';
  const now = window.moment();

  if (free) {
    // if room is currently free, calculate time until next activity
    if (roomActivities.length > 0) {
      // time to next activity
      for (let activity of roomActivities) {
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
  let free = true;
  let index = -1;
  // const roomActivities = [
  //   { begin: '2017-06-19 15:00:00', end: '2017-06-19 15:30:00' },
  //   { begin: '2017-06-19 16:00:00', end: '2017-06-19 16:30:00' },
  //   { begin: '2017-06-19 17:00:00', end: '2017-06-19 17:30:00' },
  //   { begin: '2017-06-19 18:00:00', end: '2017-06-19 18:30:00' },
  // ];
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
