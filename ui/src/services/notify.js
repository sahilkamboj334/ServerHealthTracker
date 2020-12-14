import {Notification} from 'rsuite';
export function notify(type,msg){
    Notification[type](
        {
            title:msg,
            // description: <p style={{ width: 300 }} rows={3} >{msg}</p>,
            duration:3000
        }
    )
} 