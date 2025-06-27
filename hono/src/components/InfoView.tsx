import type { FC } from 'hono/jsx'

export const InfoView: FC<{ pin: string}> = (props: { pin: string }) => {
    return (
        <div id="htmlSummaryContainer" hx-get={props.pin} hx-trigger="load"></div>
    )
};