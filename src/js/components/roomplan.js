import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { setAttributes } from '../utils';
import Activity from './activity';

export default class Roomplan {
  constructor() {
    window.moment = extendMoment(Moment);
    this.load();
    this.scene = document.querySelector('#a-scene');
    this.room1 = this.scene.querySelector('#room-1');
    this.activities = [];
    this.createDoor();
  }

  init() {
    const room358 = this.getRoomActivities('U SE 358');

    // get activities and create text node
    room358.map((a, index) => {
      const activity = new Activity(a.__row);
      this.activities.push(activity);
      const entity = document.createElement('a-text');
      setAttributes(entity, {
        value: activity.duration,
        position: `0.5 0.5 ${index * 0.3}`,
        rotation: '-90 0 0',
        color: '#f60',
      });
      this.room1.appendChild(entity);
    });
  }

  createDoor() {
    const entity = document.createElement('a-plane');
    setAttributes(entity, {
      rotation: '-90 0 0',
      position: '-2 -2 0',
      height: '3',
      width: '1',
      color: '#f60',
      opacity: '0.5',
    });
    this.scene.appendChild(entity);
  }

  async load() {
    const response = await fetch('http://localhost/roomplan.php');
    this.plan = await response.json();

    this.init();
  }

  getRoomActivities(room) {
    return this.plan.activities.filter(activity => activity.__row.roomName === room);
  }
}
