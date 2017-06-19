import {
  createMarker,
  createText,
  createFrame,
  createBox,
  createBadge,
  calculateAvailability,
  loadJSON,
} from './utils';

export default class Roomplan {
  constructor() {
    this.scene = document.querySelector('#a-scene');
    this.markers = [];

    // load the marker from the server
    const response = loadJSON('https://rooms.freinbichler.me/backend/');
    response.then((m) => {
      const loadingScreen = document.querySelector('.overlay-loading');
      loadingScreen.classList.add('hidden');
      this.markerData = m;
      this.init();
    });
  }

  init() {
    const markers = this.markerData;
    // console.log(markers);

    Object.keys(markers).forEach((key) => {
      let counter = -2;
      const marker = createMarker(key);

      // logic for each room
      const { free, duration } = calculateAvailability(markers[key].activities);
      const textObjects = this.getTextObjects({ free, duration, marker: key });

      // a frame objects
      const frame = createFrame(free);
      const textBg = createBox({ position: '0 0 0', depth: '1.15', width: '1.15', height: '0.1', color: '#fff' });
      marker.appendChild(textBg);
      frame.map(box => (marker.appendChild(box)));
      textObjects.map(obj => (marker.appendChild(obj)));

      // if there are marker activites
      markers[key].activities.map((activity) => { // eslint-disable-line
        const now = window.moment();
        // const now = window.moment('2017-06-19 08:30:00');
        const toShow = !!(now.isBetween(activity.begin, activity.end) || now.isBefore(activity.begin));
        // if activity is currently taking place or later in the day
        if (toShow) {
          const activityObj = this.getActivityObject({ activity, y: counter });
          activityObj.map(a => (marker.appendChild(a)));
          counter += 1.4;
        }
      });

      // append to scene and save markers to edit on refresh
      this.scene.appendChild(marker);
      this.markers.push(marker);
    });

    // refresh every minute
    this.refresh();
  }

  getTextObjects({ free, duration, marker }) {
    const titleText = free ? 'FREE' : 'OCCUPIED';
    const durationText = duration.humanizedDuration;
    const titleEl = createText({ position: '1 0.25 1.2', text: titleText, color: '#fff', id: 'title' });
    const durationEl = createText({ position: '1 0.25 1.6', text: durationText, color: '#fff', size: 3, id: 'duration' });
    const roomEl = createText({ position: '0 0.15 0', text: this.markerData[marker].room, color: '#000', size: 2 });
    return [titleEl, durationEl, roomEl];
  }

  getActivityObject({ activity, y }) { // eslint-disable-line
    let badgeEl;
    const timeStart = window.moment(activity.begin).format('HH:mm');
    const timeEnd = window.moment(activity.end).format('HH:mm');
    const faculty = activity.faculty.substring(0, 3);

    // create  a frame elements
    const bg = createBox({ position: `-3 0 ${y}`, depth: '1.2', width: '3', height: '0.1', color: '#fff' });
    const titleEl = createText({ position: `-3.4 0.25 ${y - 0.3}`, text: activity.name, color: '#000', align: 'left', size: 1.5 });
    const lecturerEl = createText({ position: `-3.4 0.25 ${y}`, text: activity.lecturer, color: '#000', align: 'left', size: 1.5 });
    const timeEl = createText({ position: `-3.4 0.25 ${y + 0.3}`, text: `${timeStart} - ${timeEnd}`, color: '#000', size: 1.5, align: 'left' });
    if (faculty.indexOf('MMA') !== -1 || faculty.indexOf('MMT') !== -1) {
      badgeEl = createBadge({ position: `-3.9 0.25 ${y}`, src: `#${faculty.toLowerCase()}` });
    } else {
      badgeEl = createText({ position: `-3.9 0.25 ${y}`, text: faculty, color: '#000', size: 5 });
    }
    return [titleEl, timeEl, badgeEl, lecturerEl, bg];
  }

  stopRefresh() {
    clearInterval(this.timer);
  }

  refresh() {
    this.timer = setInterval(() => {
      this.markers.map((marker) => { // eslint-disable-line
        const titleEl = marker.querySelector('#title');
        const durationEl = marker.querySelector('#duration');
        const boxes = marker.querySelectorAll('#frame');
        const key = marker.getAttribute('value');
        const { free, duration } = calculateAvailability(this.markerData[key].activities);
        const color = free ? '#30E8BF' : '#c0392b';
        const newObjs = this.getTextObjects({ free, duration, marker: key });

        // refresh title & duration value
        titleEl.setAttribute('value', newObjs[0].getAttribute('value'));
        durationEl.setAttribute('value', newObjs[1].getAttribute('value'));

        // change frame color
        [...boxes].map((box) => { // eslint-disable-line
          box.setAttribute('color', color);
        });
      });
    }, 5000);
  }

}
