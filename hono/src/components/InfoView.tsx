import type { FC } from 'hono/jsx'

export const InfoView: FC<{ pin: string}> = (props: { pin: string }) => {
    debugger
    return (
        <div id="info" hx-get={props.pin} hx-trigger="load"></div>
    )
};