import React, { useEffect, useState } from 'react';
import { Button, Icon, Row, Col, SelectPicker } from 'rsuite';
import { FormControl } from 'react-bootstrap';
import DateTimeRangeContainer from 'react-advanced-datetimerange-picker';
import moment from 'moment';
import * as httpClient from '../services/httpSrv';
import CanvasJSReact from '../canvasjs/canvasjs.react'
import axios from 'axios';
import { notify } from '../services/notify';
let CanvasJSChart = CanvasJSReact.CanvasJSChart;
let chart, ramChart;
function Reports() {
    let [chartOptions, setOptions] = useState({ cpuOptions: {}, ramOptions: {} });
    let [serverList, setServerList] = useState([]);
    let [dummy, setDummy] = useState(new Date());
    let [loading, setLoader] = useState(false);
    let [query, setQuery] = useState({
        ip: "",
        startRange: new Date(),
        endRange: new Date()
    });

    function formatDate(d) {
        var datestring = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + (d.getDate())).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
        return datestring;
    }
    function startDateTime() {
        let date = new Date();
        date.setMinutes(date.getMinutes() - 5);

        return formatDate(date);
    }
    function endDateTime() {
        return formatDate(new Date());
    }

    async function runInitTask(list) {
        let graphObjects = [];
        for (let i = 0; i < list.length; i++) {
            let obj = {};
            obj['name'] = list[i].name;
            await axios.get(process.env.REACT_APP_SERVER_BASE_URL+"server/metrics?ip=" + list[i].ip + "&startDateTime=" + startDateTime() + "&endDateTime=" + endDateTime()).then((res) => {
                let dataPoints = [];
                let ramDataPoints = [];
                res.data.forEach(element => {
                    dataPoints.push({ y: parseFloat(element['cpu_load_percent']), x: new Date(element['timestamp']) });
                    ramDataPoints.push({ y: parseFloat(element['ram_usage_percent']), x: new Date(element['timestamp']) });
                });
                obj['cpuDataPoints'] = dataPoints;
                obj['ramDataPoints'] = ramDataPoints;
                graphObjects.push(obj);
            }).catch(error => {
                console.log(error);
            });
        }
        helper(graphObjects);

    }
    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
        ramChart.render();
    }

    function helper(graphObjects) {
        let options = {
            animationEnabled: true,
            zoomEnabled: true,
            theme: "light3",
            title: {
                text: "CPU Load Trends"
            },
            axisX: {
                title: "Time"
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
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
            data: []
        };
        let ramChartOptions = {
            animationEnabled: true,
            zoomEnabled: true,
            theme: "light3",
            title: {
                text: "RAM Load Trends"
            },
            axisX: {
                title: "Time"
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
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
            data: []
        }
        graphObjects.forEach(element => {
            let obj = {
                type: "area",
                name: element.name,
                showInLegend: true,
                dataPoints: element['cpuDataPoints']
            };
            let ramObj = {
                type: "area",
                name: element.name,
                showInLegend: true,
                dataPoints: element['ramDataPoints']
            };
            options.data.push(obj);
            ramChartOptions.data.push(ramObj);

        });
        setOptions({ cpuOptions: options, ramOptions: ramChartOptions });
    }

    useEffect(() => {
        httpClient.get(process.env.REACT_APP_SERVER_BASE_URL+"server/list", (res) => {
            runInitTask(res.data);
            let list = [];
            res.data.forEach(val => {
                list.push({ value: val.ip, label: val.name });
            });
            setServerList(list);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dummy]);

    let updateQuery = (value, key) => {
        setQuery(
            {
                ...query,
                [key]: value
            }
        );

    }

    function fetchAndRenderGraph() {
        if (query.ip.length <= 0) {
            notify("error", "Please Select Server to proceed !");
            return;
        }
        setLoader(true);
        let graphObjects = []
        let obj={};
        obj['name']=query.ip;
        httpClient.get(process.env.REACT_APP_SERVER_BASE_URL+"server/metrics?ip=" + query.ip + "&startDateTime=" + formatDate(query.startRange) + "&endDateTime=" + formatDate(query.endRange), (res) => {
            let dataPoints = [];
            let ramDataPoints = [];
            res.data.forEach(element => {
                dataPoints.push({ y: parseFloat(element['cpu_load_percent']), x: new Date(element['timestamp']) });
                ramDataPoints.push({ y: parseFloat(element['ram_usage_percent']), x: new Date(element['timestamp']) });
            });
            obj['cpuDataPoints'] = dataPoints;
            obj['ramDataPoints'] = ramDataPoints;
            graphObjects.push(obj);
            helper(graphObjects);
            setLoader(false);
        });
    }
    let ranges = {
        "Today Only": [moment(new Date()), moment(new Date())]
    }
    let local = {
        "format": "DD-MM-YYYY HH:mm",
        "sundayFirst": false,
        days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'So'],
        months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',],
        fromDate: 'From Date',
        toDate: 'To Date',
        selectingFrom: 'Selecting From',
        selectingTo: 'Selecting To',
        maxDate: 'Max Date',
        close: 'Close',
        apply: 'Apply',
        cancel: 'Cancel'
    }
    let maxDate = moment(new Date());
    let applyCallbackFun = (start, end) => {
        setQuery({
            ...query,
            startRange: start['_d'],
            endRange: end['_d']
        });
    }
    return (
        <React.Fragment>
            <Row>
                <Col style={{ display: "inline-flex" }}>
                    <SelectPicker name="ip" data={serverList} style={{ width: 200, height: 40, marginTop: 5, marginLeft: 10, marginRight: 10 }} placeholder="Select Server" onChange={(value) => updateQuery(value, "ip")} />
                    <DateTimeRangeContainer applyCallback={applyCallbackFun} ranges={ranges} local={local} maxDate={maxDate} start={moment(new Date())} end={moment(new Date())}>
                        <FormControl
                            style={{ width: 200, marginTop: 5 }}
                            type="text"
                            label="Text"
                            placeholder={query.startRange + "-" + query.endRange}
                        />
                    </DateTimeRangeContainer>
                    <Button appearance="subtle" style={{ marginTop: 5, marginLeft: 10, color: "white", backgroundColor: "cornflowerblue", height: 35 }} onClick={fetchAndRenderGraph} loading={loading}>Generate Report</Button>
                </Col>
                <Col style={{ display: "inline" }}>
                    <Button onClick={() => { setDummy(new Date()); }} appearance="subtle" style={{ marginTop: 5, color: "white", backgroundColor: "gray", marginRight: 10, float: "right" }}><Icon icon="refresh"></Icon> Refresh</Button>
                </Col>
            </Row>
            <Row><span style={{ marginTop: 10, color: "red" }}> *By default chart will display trends for all configured server for last five minutes.</span></Row>
            <hr />
            <CanvasJSChart options={chartOptions.cpuOptions}
                onRef={ref => chart = ref}
            />
            <hr />
            <CanvasJSChart options={chartOptions.ramOptions}
                onRef={ref => ramChart = ref}
            />
        </React.Fragment>
    );
}
export default Reports