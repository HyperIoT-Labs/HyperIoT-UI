export interface Graph {
    data?: any[],
    layout?: {
        width?: number | string,
        height?: number | string,
        responsive?: boolean,
        autosize?: boolean,

        margin?: {
            l?: number,
            r?: number,
            t?: number,
            b?: number,
            pad?: number,
            autoexpand?: boolean
        },
        pad?: {
            l?: number,
            r?: number,
            t?: number,
            b?: number,
        },
        font?: {
            size?: number
        },
        title?: string,
        paper_bgcolor?: string,
        plot_bgcolor?: string
        xaxis?: {
            automargin?: boolean,
            autorange?: boolean,
            tickangle?: number,
            showgrid?: boolean,
            range?: number[],
            type?: string
        },
        yaxis?: {
            automargin?: boolean,
            autorange?: boolean,
            range?: number[],
            domain?: [
                number,
                number
            ],
            title?: string,
            ticktext?: string[],
            tickvals?: number[]
            type?: string,
            tickmode?: string,
            titlefont?: {
                size?: number
            },
        }
    }
}
