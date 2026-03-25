import { TimeStep } from 'components';
import { DefaultTimelineCustomRange, DefaultTimelineRange } from './dashboardTimelineDefaultRange';
import * as moment_ from 'moment';

const moment = moment_;

export interface DefaultTimeLineRangeHandler<T extends DefaultTimelineRange> {
  readonly label: string;

  domainInterval(range: T): TimeStep;
  buildInterval(range: T): [Date, Date];
  getConfirmMessage(range: T): string;
}

export const NoneTimeLineRangeHandler: DefaultTimeLineRangeHandler<DefaultTimelineRange> = {
  label: $localize`:@@HYT_default_timeline_range_none:No Default`,

  domainInterval: (range) => 'month',
  buildInterval: (range) => {
    const refDate = new Date();
    return [refDate, refDate];
  },
  getConfirmMessage: (range) => NoneTimeLineRangeHandler.label,
}

export const LastWeekTimeLineRangeHandler: DefaultTimeLineRangeHandler<DefaultTimelineRange> = {
  label: $localize`:@@HYT_default_timeline_range_lastWeek:Last Week`,

  domainInterval: (range) => 'day',
  buildInterval: (range) => {
    const refDate = new Date();
    return [moment(refDate).subtract(7, 'days').toDate(), refDate];
  },
  getConfirmMessage: (range) => LastWeekTimeLineRangeHandler.label,
}

export const LastMonthTimeLineRangeHandler: DefaultTimeLineRangeHandler<DefaultTimelineRange> = {
  label: $localize`:@@HYT_default_timeline_range_lastMonth:Last Month`,

  domainInterval: (range) => 'day',
  buildInterval: (range) => {
    const refDate = new Date();
    return [moment(refDate).subtract(1, 'month').toDate(), refDate];
  },
  getConfirmMessage: (range) => LastMonthTimeLineRangeHandler.label,
}

export const CustomTimeLineRangeHandler: DefaultTimeLineRangeHandler<DefaultTimelineCustomRange> = {
  label: $localize`:@@HYT_default_timeline_range_custom:Custom`,

  domainInterval: (range) => {
    const interval = CustomTimeLineRangeHandler.buildInterval(range);
    const d1 = moment(interval[0]);
    const d2 = moment(interval[1]);
    const diff = Math.abs(d1.diff(d2, 'seconds'));

    if (diff < 60) {
      return 'second';
    } else if (diff < 3600) {
      return 'minute';
    } else if (diff < 86400) {
      return 'hour';
    } else if (diff < 2592000) {
      return 'day';
    } else {
      return 'month';
    }
  },
  buildInterval: (range) => {
    const refDate = range.endDateCurrentTime ? new Date() : new Date(range.endDate);
    return [new Date(range.startDate), new Date(refDate)];
  },
  getConfirmMessage: (range) => {
    const start = moment(range.startDate).format('DD/MM/YYYY HH:mm:ss');
    const end = range.endDateCurrentTime 
      ? $localize`:@@HYT_current_time:Current Time` 
      : moment(range.endDate).format('DD/MM/YYYY HH:mm:ss');
    return 'Custom (' + start + ' - ' + end + ')';
  },
}
