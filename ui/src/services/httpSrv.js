import axios from 'axios';
import {notify} from '../services/notify';

export function get(url,callback){
    axios.get(url).then((response)=>{
        callback(response);
    }).catch(error=>{
        console.log(error);
        //notify("error",error.response.data.message);
    });
}

export function post(url,body,callback){
    axios.post(url,body,{headers:{"Content-Type":"application/json"}}).then((response)=>{
    callback(response);
    }).catch(error=>{
        notify("error",error.response.data.message);
    });
}