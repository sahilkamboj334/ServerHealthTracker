import React,{useEffect,useState}from 'react';
import { Button, Row ,SelectPicker,Progress} from 'rsuite';
import CanvasJSReact from '../canvasjs/canvasjs.react'
import * as HttpClient from '../services/httpSrv';
import { notify } from '../services/notify';

let CanvasJSChart = CanvasJSReact.CanvasJSChart;
let cpuChart,ramChart;
let cpuChartDataPoint=[];
let ramChartDataPoint=[];
let initialInterval;

function LiveReport(){
    
    let [serverList, setServerList] = useState([]);
    let [activeSelection,setSelection]=useState({});
    let [percent,setPercent]=useState(0);
    useEffect(()=>{
        HttpClient.get(process.env.REACT_APP_SERVER_BASE_URL+"server/list",(res)=>{
            let dataItemObj=[];
            res.data.forEach(element => {
                let obj={};
                obj['label']=element.name;
                obj['value']=element.serviceUrl;
                dataItemObj.push(obj);
            });
            setServerList(dataItemObj);
        });
        ramChartDataPoint=[];
        cpuChartDataPoint=[];
        ramChart.render();cpuChart.render();
        return () => {
            clearInterval(initialInterval);
        }
    },[]);
    let cpuChartOptions = {
        animationEnabled: true,
        zoomEnabled:true,
        exportEnabled:true,
        theme: "light2",
        showInLegend: true,
        title: {
            text: "CPU Load Trends"
        },
        axisX: {
            title: "Time"
        },
        legend: {
            cursor: "pointer"
        },
        axisY: {
            title: "Usage %",
            titleFontColor: "#6D78AD",
            lineColor: "#6D78AD",
            labelFontColor: "#6D78AD",
            tickColor: "#6D78AD"
        },
        data: [{
            type:"area",
            dataPoints:cpuChartDataPoint
        }]
    }
    let ramChartOptions = {
        animationEnabled: true,
        zoomEnabled:true,
        exportEnabled:true,
        theme: "light2",
        title: {
            text: "RAM Load Trends"
        },
        axisX: {
            title: "Time"
        },
        legend: {
            cursor: "pointer"
        },
        axisY: {
            title: "Usage %",
            titleFontColor: "#6D78AD",
            lineColor: "#6D78AD",
            labelFontColor: "#6D78AD",
            tickColor: "#6D78AD"
        },
        toolTip: {
            shared: true
        },
        data: [{
            type:"area",
            dataPoints:ramChartDataPoint
        }]
    }

    let reRender=()=>{
        if(activeSelection===null || activeSelection.value===undefined){
            notify("error","Please select server to proceed !");
            return;
        }
        clearInterval(initialInterval);
        cpuChartDataPoint=[];
        ramChartDataPoint=[];
        initialInterval=setInterval(()=>{
            HttpClient.get(activeSelection.value,(res)=>{
                let healthObj=res.data;
                setPercent(parseFloat(healthObj['storage_used_percent']));
                if(cpuChartDataPoint.length>30 || ramChartDataPoint.length>30){
                    cpuChartDataPoint.shift();
                    ramChartDataPoint.shift();
                }
                cpuChartDataPoint.push({x:new Date(healthObj['timestamp']),y:parseFloat(healthObj['cpu_load_percent'])});
                ramChartDataPoint.push({x:new Date(healthObj['timestamp']),y:parseFloat(healthObj['ram_usage_percent'])});
                cpuChart.render();
                ramChart.render();

            });
        },3000);
    }
    const {Circle}=Progress;
    return(
        <React.Fragment>
            <Row style={{marginTop:10}}>
                <SelectPicker placeholder="Select Server" style={{marginLeft:10}} data={serverList} onSelect={(value,item,event)=>{setSelection(item);}}></SelectPicker>
                <Button appearance="subtle" onClick={reRender} style={{color:"white",backgroundColor:"cornflowerblue", marginLeft:10}}>Monitor</Button>
                <Circle strokeWidth={10} percent={percent} showInfo={true} style={{marginRight:20,float:"right",display:"inline-block",width:50}}></Circle>
                <span style={{marginRight:10,marginTop:10,float:"right",display:"inline-block"}}>Memory Usage</span>

            </Row>
            <hr></hr>
            <CanvasJSChart options={cpuChartOptions}
                onRef={ref => cpuChart = ref}
            />
             <hr></hr>
             <CanvasJSChart options={ramChartOptions}
                onRef={ref => ramChart = ref}
            /> 
        </React.Fragment>
    );
}
export default LiveReport;