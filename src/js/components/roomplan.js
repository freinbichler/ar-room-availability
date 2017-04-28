import Moment from 'moment';
import { extendMoment } from 'moment-range';
import humanizeDuration from 'humanize-duration';


export default class Roomplan {
  constructor() {
    this.moment = extendMoment(Moment);

    this.load();
  }

  async load() {
    const response = await fetch('http://localhost/roomplan.php');
    this.plan = await response.json();

    this.init();
  }

  init() {
    this.getRoomActivities('U SE 358').map((activity) => {
      console.log(activity.__row.activityName, activity.__row.activityBegin, activity.__row.activityEnd, activity.__row.lecturerName);

      const start = this.moment(activity.__row.activityBegin);
      const end   = this.moment(activity.__row.activityEnd);
      const range = this.moment.range(start, end);
      const duration = range + 0;
      console.log(humanizeDuration(duration));
    });
  }

  getRoomActivities(room) {
    return this.plan.activities.filter((activity) => {
      return activity.__row.roomName === room;
    });
  }
};
