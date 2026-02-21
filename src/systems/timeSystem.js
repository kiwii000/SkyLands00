import { DAY_START, PASS_OUT_TIME } from '../utils/constants';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export class TimeSystem {
  constructor() {
    this.day = 1;
    this.weekdayIndex = 0;
    this.minutes = DAY_START;
    this.speed = 6;
    this.passOutTriggered = false;
  }

  update(deltaSeconds) {
    this.minutes += deltaSeconds * this.speed;
    if (this.minutes >= PASS_OUT_TIME && !this.passOutTriggered) {
      this.passOutTriggered = true;
      return { event: 'passOut' };
    }
    return null;
  }

  sleepUntilMorning() {
    this.rollDay();
  }

  rollDay() {
    this.day += 1;
    this.weekdayIndex = (this.weekdayIndex + 1) % WEEKDAYS.length;
    this.minutes = DAY_START;
    this.passOutTriggered = false;
  }

  getState() {
    return { day: this.day, weekdayIndex: this.weekdayIndex, minutes: Math.floor(this.minutes) };
  }

  setState(state) {
    this.day = state.day;
    this.weekdayIndex = state.weekdayIndex;
    this.minutes = state.minutes;
    this.passOutTriggered = false;
  }

  get weekday() {
    return WEEKDAYS[this.weekdayIndex];
  }
}
