/**
 * This class hold a time series data and configuration.
 * To be used with {@link WidgetChartComponent}
 */
export class TimeSeries {
    /**
     * Serie id
     */
    id: number;
    /**
     * Serie name
     */
    name: string;
    /**
     * Serie label
     */
    label: string;
    /**
     * X-Axis time values local buffer
     */
    x: Date[];
    /**
     * Y-Axis data values local buffer
     */
    y: number[];

    line?: any;

    lastBufferIndexUpdated: number;

    constructor(id: number, name: string, label?: string) {
        this.id = id;
        this.name = name;
        this.label = label || name;
        this.x = [];
        this.y = [];
        this.lastBufferIndexUpdated = 0;
    }

     /**
      * Generate random data for a given date range
      *
      * @param startDate The start date
      * @param endDate The end date
      * @param interval The data generation interval in seconds
      */
    randomize(startDate: Date, endDate: Date, interval: number = 30) {
        for (let m = startDate.getTime(); m < endDate.getTime(); m += interval * 1000) {
            this.x.push(new Date(m));
            const randomValue = 20 + (Math.random() * 15);
            this.y.push(randomValue);
        }
    }
}
