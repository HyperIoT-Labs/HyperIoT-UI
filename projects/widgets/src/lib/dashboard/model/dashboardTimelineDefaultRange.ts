import { CustomTimeLineRangeHandler, DefaultTimeLineRangeHandler, LastMonthTimeLineRangeHandler, LastWeekTimeLineRangeHandler, NoneTimeLineRangeHandler } from './DefaultTimelineRangeUtils';

export type DefaultTimelineRangeType = 'none' | 'lastWeek' | 'lastMonth' | 'custom';

export type DefaultTimelineRange =
    | {
        type: 'none' | 'lastWeek' | 'lastMonth';
    }
    | DefaultTimelineCustomRange;

export type DefaultTimelineCustomRange = {
    type: 'custom';
    startDate: Date;
    endDate?: Date;
    endDateCurrentTime: boolean;
}

export const DefaultTimelineRangeTypeUtilsMap: Map<DefaultTimelineRangeType, DefaultTimeLineRangeHandler<DefaultTimelineRange>> = new Map<DefaultTimelineRangeType, DefaultTimeLineRangeHandler<DefaultTimelineRange>>([
  ['none', NoneTimeLineRangeHandler],
  ['lastWeek', LastWeekTimeLineRangeHandler],
  ['lastMonth', LastMonthTimeLineRangeHandler],
  ['custom', CustomTimeLineRangeHandler],
]);
