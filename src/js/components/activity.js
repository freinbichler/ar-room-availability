import humanizeDuration from 'humanize-duration';

export default class Activity {
  constructor(el) {
    this.start = el.activityBegin;
    this.end  = el.activityEnd;
    this.name  = el.activityName;
    this.range = window.moment.range(window.moment(this.start), window.moment(this.end));
    this.duration = humanizeDuration(this.range + 0);
  }
};
