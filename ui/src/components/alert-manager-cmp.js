import React from 'react';
import { notify } from '../services/notify';
import * as httpClient from '../services/httpSrv';
import { Button, Icon, Table, Modal, Row, Col, Input, Toggle, ButtonToolbar, ButtonGroup, SelectPicker } from 'rsuite';
import ModalFooter from 'rsuite/lib/Modal/ModalFooter';
const { Column, HeaderCell, Cell, Pagination } = Table;



class AlertComponent extends React.Component {
    constructor() {
        super()
        this.state = {
            deleteLoader: false,
            ipForDelete: "",
            addModelOpen: false,
            deleteModelOpen: false,
            data: [],
            displayLength: 10,
            tableLoading: false,
            createReqLoading: false,
            page: 1,
            modelOpen: false,
            selectList: [],
            modelData: {
                ip: "",
                thresholdMap: {
                    ram_threshold: 0.0,
                    cpu_threshold: 0.0,
                    memory_threshold: 0.0
                },
                trackCycleInSeconds: 0,
                trackPeriodTime: 0,
                triggerMail: false,
                recipientsMap: {
                    to: "",
                    cc: ""
                },
                isActive: false,
                bufferTimeBwAlerts: 0,
            },
            alertObject: {
                ip: "",
                thresholdMap: {
                    ram_threshold: 0.0,
                    cpu_threshold: 0.0,
                    memory_threshold: 0.0
                },
                trackCycleInSeconds: 0,
                trackPeriodTime: 0,
                triggerMail: false,
                recipientsMap: {
                    to: "",
                    cc: ""
                },
                isActive: false,
                bufferTimeBwAlerts: 0,
            },
            requestOn: false
        }
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleChangeLength = this.handleChangeLength.bind(this);
    }
    handleChangePage(dataKey) {
        this.setState({
            page: dataKey
        });
    }
    handleChangeLength(dataKey) {
        this.setState({
            page: 1,
            displayLength: dataKey
        });
    }
    EMAIL_REGEX="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info)\b";
    //handle table tableLoading again
    updateRequest = () => {
        if (this.state.modelData.ip.length <= 0) {
            notify("error", "All Fields are required!");
            return;
        }
        if (this.state.modelData.triggerMail) {
            if (this.state.modelData.recipientsMap['to'].length <= 0) {
                notify("error", "Please provide To recipients!");
                return;
            } else {
                let regex = new RegExp(this.EMAIL_REGEX);
                let emails = this.state.modelData.recipientsMap["to"].split(",");
                console.log(emails);
                for(let i=0;i<emails.length;i++){
                    if(!regex.test(emails[i])){
                        notify("error", "Please provide valid To recipients Id's!");
                        return;
                    }
                }
                let ccEmails = this.state.modelData.recipientsMap["cc"].split(",");
                if(ccEmails.length>0){
                    for(let i=0;i<emails.length;i++){
                        if(!regex.test(emails[i])){
                            notify("error", "Please provide valid cc recipients Id's!");
                            return;
                        }
                }
               
            }
        }
    }
        this.setState({ ...this.state, requestOn: true });
        httpClient.post(process.env.REACT_APP_ALERT_BASE_URL+"update", this.state.modelData, (res) => {
            this.setState({
                ...this.state, requestOn: false, modelOpen: false, modelData: {
                    ip: "",
                    thresholdMap: {
                        ram_threshold: 0.0,
                        cpu_threshold: 0.0,
                        memory_threshold: 0.0
                    },
                    trackCycleInSeconds: 0,
                    trackPeriodTime: 0,
                    triggerMail: false,
                    recipientsMap: {
                        to: "",
                        cc: ""
                    },
                    isActive: false,
                    bufferTimeBwAlerts: 0,
                }
            });
            notify("success", res.data.message);
            this.refresh();
        });
    }

    deleteRequest = () => {
        this.setState({ ...this.state, deleteLoader: true });
        httpClient.post(process.env.REACT_APP_ALERT_BASE_URL+"delete?ip=" + this.state.ipForDelete, null, (res) => {
            this.setState({ ...this.state, deleteLoader: false, ipForDelete: "", deleteModelOpen: false });
            notify("success", res.data.message);
            this.refresh();
        });
    }
    refresh = () => {
        this.setState({
            ...this.state,
            tableLoading: true
        });
        httpClient.get(process.env.REACT_APP_ALERT_BASE_URL+"list", (outerRes) => {
            httpClient.get(process.env.REACT_APP_SERVER_BASE_URL+"list", (res) => {
                let list = [];
                res.data.forEach(val => {
                    list.push({ value: val.ip, label: val.name });
                });
                this.setState({
                    ...this.state,
                    data: outerRes.data,
                    selectList: list,
                    tableLoading: false
                });
            });
        });
    }
    componentDidMount() {
        this.refresh();
    }

    getData() {
        const { displayLength, page } = this.state;
        return this.state.data.filter((v, i) => {
            const start = displayLength * (page - 1);
            const end = start + displayLength;
            return i >= start && i < end;
        });
    }
    changeHandler = (v, event) => {
        this.setState({
            alertObject: { ...this.state.alertObject, thresholdMap: { ...this.state.alertObject.thresholdMap, [event.target.name]: event.target.value } }
        });
    }
    updateChangeHandler = (v, event) => {
        this.setState({
            modelData: { ...this.state.modelData, thresholdMap: { ...this.state.modelData.thresholdMap, [event.target.name]: event.target.value } }
        });
    }

    process = () => {
        if (this.state.alertObject.ip.length <= 0) {
            notify("error", "All Fields are required!");
            return;
        }
        if (this.state.alertObject.triggerMail) {
            if (this.state.alertObject.recipientsMap['to'].length <= 0) {
                notify("error", "Please provide To recipients!");
                return;
            } else {
                let regex = new RegExp(this.EMAIL_REGEX);
                let emails = this.state.alertObject.recipientsMap["to"].split(",");
                let cmp = [...emails, this.state.alertObject.recipientsMap["cc"].split(",")];
                cmp.forEach(email => {
                    if (!regex.test(email)) {
                        notify("error", "Please provide valid To/cc recipients Id's!");
                        return;
                    }
                });
            }
        }
        this.setState({ ...this.state, createReqLoading: true });
        httpClient.post(process.env.REACT_APP_ALERT_BASE_URL+"add", this.state.alertObject, (res) => {
            this.setState({
                ...this.state, createReqLoading: false, addModelOpen: false, alertObject: {
                    ip: "",
                    thresholdMap: {
                        ram_threshold: 0.0,
                        cpu_threshold: 0.0,
                        memory_threshold: 0.0
                    },
                    trackCycleInSeconds: 0,
                    trackPeriodTime: 0,
                    triggerMail: false,
                    recipientsMap: {
                        to: "",
                        cc: ""
                    },
                    isActive: false,
                    bufferTimeBwAlerts: 0
                }
            });
            notify("success", res.data.message);
            this.refresh();
        });

    }

    DeleteModel = () => {
        return (
            <Modal backdrop="static" show={this.state.deleteModelOpen} onHide={() => { this.setState({ ...this.state, deleteModelOpen: false }) }}>
                <Modal.Header>
                    <Modal.Title><Icon icon="warning" style={{ color: "red" }} /></Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflow: "hidden" }}>
                    Are you sure ?
        </Modal.Body>
                <ModalFooter>
                    <ButtonGroup>
                        <Button appearance="subtle" style={{ backgroundColor: "red", color: "white" }} onClick={this.deleteRequest} loading={this.state.deleteLoader}>Yes</Button>
                        <Button appearance="subtle" onClick={() => { this.setState({ ...this.state, deleteModelOpen: false }) }}><Icon icon="close" />No</Button>
                    </ButtonGroup>
                </ModalFooter>
            </Modal>
        );
    }
    Recipient = () => {
        if (this.state.alertObject.triggerMail) {
            return (
                <React.Fragment>
                    <Row style={{ marginBottom: 10 }}>
                        <Col sm={12} md={12}>
                            <label>To : </label><Input placeholder="eg. a@b.com,b@c.com" type="text" name="to" value={this.state.alertObject.recipientsMap['to']} onChange={(_, event) => { this.setState({ alertObject:  {...this.state.alertObject,recipientsMap:{...this.state.alertObject.recipientsMap, to: _ } }}) }} />
                        </Col>
                        <Col sm={12} md={12}>
                            <label>Cc : </label><Input placeholder="eg. a@b.com,b@c.com" type="text" name="cc" value={this.state.alertObject.recipientsMap['cc']} onChange={(_, event) => { this.setState({ alertObject: { ...this.state.alertObject,recipientsMap:{...this.state.alertObject.recipientsMap, cc: _ } }}) }} />
                        </Col>
                    </Row>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment></React.Fragment>
            );
        }
    }
    UpdateModelRecipient = () => {
        if (this.state.modelData.triggerMail) {
            return (
                <React.Fragment>
                    <Row style={{ marginBottom: 10 }}>
                        <Col sm={12} md={12}>
                            <label>To : </label><Input placeholder="eg. a@b.com,b@c.com" type="text" name="to" value={this.state.modelData.recipientsMap['to']} onChange={(_, event) => { this.setState({ modelData: { ...this.state.modelData,recipientsMap:{...this.state.modelData.recipientsMap, to: _ }}}) }} />
                        </Col>
                        <Col sm={12} md={12}>
                            <label>Cc : </label><Input placeholder="eg. a@b.com,b@c.com" type="text" name="cc" value={this.state.modelData.recipientsMap['cc']} onChange={(_, event) => { this.setState({ modelData: { ...this.state.modelData,recipientsMap:{...this.state.modelData.recipientsMap, cc: _ }}}) }} />
                        </Col>
                    </Row>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment></React.Fragment>
            );
        }
    }
    addModelCloseEvent = () => {
        this.setState({
            ...this.state, addModelOpen: false, alertObject: {
                ip: "",
                thresholdMap: {
                    ram_threshold: 0.0,
                    cpu_threshold: 0.0,
                    memory_threshold: 0.0
                },
                trackCycleInSeconds: 0,
                trackPeriodTime: 0,
                triggerMail: false,
                recipientsMap: {
                    to: "",
                    cc: ""
                },
                isActive: false,
                bufferTimeBwAlerts: 0
            }
        })
    }
    AddModel = () => {
        return (
            <React.Fragment>
                <Row style={{ marginBottom: 10 }}>
                    <ButtonToolbar>
                        <Button onClick={() => { this.setState({ ...this.state, addModelOpen: true }) }} appearance="primary" style={{ marginTop: 10, marginRight: 10, float: "right" }}><Icon icon="plus-circle" /> Add</Button>
                    </ButtonToolbar>
                </Row>
                <Modal backdrop="static" show={this.state.addModelOpen} onHide={this.addModelCloseEvent}>
                    <Modal.Header>
                        <Modal.Title>Configure New Alert</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ overflow: "hidden", maxHeight: 250 }}>
                        <Row style={{ marginBottom: 10 }}>
                            <Col sm={12} md={8}>
                                <SelectPicker placeholder="Select Machine IP*....."
                                    data={this.state.selectList} onChange={(value) => { this.setState({ alertObject: { ...this.state.alertObject, ip: value } }) }} />
                            </Col>
                            <Col sm={12} md={8}>
                                <SelectPicker placeholder="TrackEvery(Seconds)*" data={[{ label: 10, value: 10 }, { label: 20, value: 20 }, { label: 30, value: 30 }, { label: 40, value: 40 }, { label: 50, value: 50 }, { label: 60, value: 60 }]} onChange={(value) => { this.setState({ alertObject: { ...this.state.alertObject, trackCycleInSeconds: value } }) }} />
                            </Col>
                            <Col sm={12} md={8}>
                                <SelectPicker placeholder="TrackDuration(Minutes)*" data={[{ label: 1, value: 1 }, { label: 2, value: 2 }, { label: 3, value: 3 }, { label: 4, value: 4 }, { label: 5, value: 5 }]} onChange={(value) => { this.setState({ alertObject: { ...this.state.alertObject, trackPeriodTime: value } }) }} />
                            </Col>
                        </Row>
                        <Row style={{ marginBottom: 10 }}>
                            <Col sm={12} md={8}>
                                <label>CPU Threshold : </label><Input type="number" style={{MozAppearance:"none",WebkitAppearance:"none",margin:0}} name="cpu_threshold" value={this.state.alertObject.thresholdMap['cpu_threshold']} onChange={(_, event) => { this.changeHandler(_, event) }} />
                            </Col>
                            <Col sm={12} md={8}>
                                <label>RAM Threshold : </label> <Input placeholder="RAM Threshold*" type="number" name="ram_threshold" value={this.state.alertObject.thresholdMap['ram_threshold']} onChange={(_, event) => { this.changeHandler(_, event) }} />
                            </Col>
                            <Col sm={12} md={8}>
                                <label>Drive Threshold : </label> <Input placeholder="Memory(Drive:) Threshold*" type="number" name="memory_threshold" value={this.state.alertObject.thresholdMap['memory_threshold']} onChange={(_, event) => { this.changeHandler(_, event) }} />
                            </Col>
                        </Row>
                        <Row style={{ marginBottom: 10 }}>
                            <Col md={6}>
                                <label>Active : </label> <Toggle size="md" checkedChildren="Active" unCheckedChildren="InActive" onChange={(_, event) => { this.setState({ alertObject: { ...this.state.alertObject, isActive: _ } }) }} />
                            </Col>
                            <Col md={6} style={{width:'32%'}}>
                                <label>TriggerMail : </label> <Toggle size="md"  checkedChildren="Active" unCheckedChildren="InActive" onChange={(_, event) => { this.setState({ alertObject: { ...this.state.alertObject, triggerMail: _ } }) }} />
                            </Col>
                            <Col sm={6} md={6} style={{width:'32%',marginLeft:55}}>
                                <SelectPicker  placeholder="BufferBWAlerts(Minutes)*" data={[{ label: 1, value: 1 }, { label: 2, value: 2 }, { label: 3, value: 3 }, { label: 4, value: 4 }, { label: 5, value: 5 }]} onChange={(value) => { this.setState({ alertObject: { ...this.state.alertObject, bufferTimeBwAlerts: value } }) }} />
                            </Col>
                        </Row>
                        <this.Recipient></this.Recipient>
                    </Modal.Body>
                    <Modal.Footer style={{ marginTop: 10 }}>
                        <Button onClick={this.process} appearance="primary" loading={this.state.createReqLoading}>
                            <Icon icon="save" /> Add
            </Button>
                        <Button onClick={this.addModelCloseEvent} appearance="subtle">
                            Cancel
            </Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );
    }
    render() {
        const data = this.getData();
        const { tableLoading, displayLength, page } = this.state;
        return (
            <React.Fragment>
                <this.AddModel></this.AddModel>
                <hr></hr>
                <Table height={420} data={data} loading={tableLoading} >
                    <Column flexGrow={1}>
                        <HeaderCell>Machine IP</HeaderCell>
                        <Cell dataKey="ip" />
                    </Column>
                    <Column flexGrow={1}>
                        <HeaderCell>Status</HeaderCell>
                        <Cell>
                            {(rowData, rowIndex) => {
                                return <React.Fragment>{rowData.isActive ? "Active" : "InActive"}</React.Fragment>;
                            }}
                        </Cell>
                    </Column>
                    <Column flexGrow={1}>
                        <HeaderCell>Action</HeaderCell>
                        <Cell>
                            {
                                rowData => {
                                    return (
                                        <React.Fragment>
                                            <Button appearance="subtle" onClick={() => { this.setState({ ...this.state, modelOpen: true, modelData: rowData }) }}><Icon icon="pencil" style={{ color: "blue" }}></Icon></Button>
                                            <Button appearance="subtle" onClick={() => { this.setState({ ...this.state, deleteModelOpen: true, ipForDelete: rowData.ip }) }}><Icon icon="trash" style={{ color: "blue" }}></Icon></Button>
                                            <this.DeleteModel></this.DeleteModel>
                                            <Modal backdrop="static" show={this.state.modelOpen} onHide={() => { this.setState({ ...this.state, modelOpen: false }) }}>
                                                <Modal.Header>
                                                    <Modal.Title>Edit Alert</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body style={{ overflow: "hidden", maxHeight: 250 }}>
                                                    <Row style={{ marginBottom: 10 }}>
                                                        <Col sm={12} md={8}>
                                                            <SelectPicker defaultValue={this.state.modelData.ip}
                                                                data={this.state.selectList} onChange={(value) => { this.setState({ modelData: { ...this.state.modelData, ip: value } }) }} />
                                                        </Col>
                                                        <Col sm={12} md={8}>
                                                            <SelectPicker defaultValue={this.state.modelData.trackCycleInSeconds} data={[{ label: 10, value: 10 }, { label: 20, value: 20 }, { label: 30, value: 30 }, { label: 40, value: 40 }, { label: 50, value: 50 }, { label: 60, value: 60 }]} onChange={(value) => { this.setState({ modelData: { ...this.state.modelData, trackCycleInSeconds: value } }) }} />
                                                        </Col>
                                                        <Col sm={12} md={8}>
                                                            <SelectPicker defaultValue={this.state.modelData.trackPeriodTime} data={[{ label: 1, value: 1 }, { label: 2, value: 2 }, { label: 3, value: 3 }, { label: 4, value: 4 }, { label: 5, value: 5 }]} onChange={(value) => { this.setState({ modelData: { ...this.state.modelData, trackPeriodTime: value } }) }} />
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginBottom: 10 }}>
                                                        <Col sm={12} md={8}>
                                                            <label>CPU Threshold : </label><Input type="number" name="cpu_threshold" value={this.state.modelData.thresholdMap['cpu_threshold']} onChange={(_, event) => { this.updateChangeHandler(_, event) }} />
                                                        </Col>
                                                        <Col sm={12} md={8}>
                                                            <label>RAM Threshold : </label> <Input placeholder="RAM Threshold*" type="number" name="ram_threshold" value={this.state.modelData.thresholdMap['ram_threshold']} onChange={(_, event) => { this.updateChangeHandler(_, event) }} />
                                                        </Col>
                                                        <Col sm={12} md={8}>
                                                            <label>Drive Threshold : </label> <Input placeholder="Memory(Drive:) Threshold*" type="number" name="memory_threshold" value={this.state.modelData.thresholdMap['memory_threshold']} onChange={(_, event) => { this.updateChangeHandler(_, event) }} />
                                                        </Col>
                                                    </Row>
                                                    <Row style={{ marginBottom: 10 }}>
                                                        <Col sm={6} md={6}>
                                                            <label>Active : </label> <Toggle size="md" checkedChildren="Active" checked={this.state.modelData.isActive} unCheckedChildren="InActive" onChange={(_, event) => { this.setState({ modelData: { ...this.state.modelData, isActive: _ } }) }} />
                                                        </Col>
                                                        <Col md={6} style={{width:'32%'}}>
                                                            <label>TriggerMail : </label> <Toggle size="md"  checkedChildren="Active" unCheckedChildren="InActive" onChange={(_, event) => { this.setState({ modelData: { ...this.state.modelData, triggerMail: _ } }) }} />
                                                         </Col>
                                                        <Col sm={6} md={6} style={{width:'32%',marginLeft:55}}>
                                                            <SelectPicker  placeholder="BufferBWAlerts(Minutes)*" defaultValue={this.state.modelData.bufferTimeBwAlerts} data={[{ label: 1, value: 1 }, { label: 2, value: 2 }, { label: 3, value: 3 }, { label: 4, value: 4 }, { label: 5, value: 5 }]} onChange={(value) => { this.setState({ modelData: { ...this.state.modelData, bufferTimeBwAlerts: value } }) }} />
                                                        </Col>
                                                    </Row>
                                                    <this.UpdateModelRecipient></this.UpdateModelRecipient>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button appearance="primary" onClick={this.updateRequest} loading={this.state.requestOn}>
                                                        <Icon icon="refresh" /> Update
                                              </Button>
                                                    <Button appearance="subtle" onClick={() => { this.setState({ ...this.state, modelOpen: false }) }}>
                                                        <Icon icon="close" /> Cancel
                                           </Button>
                                                </Modal.Footer>
                                            </Modal>
                                        </React.Fragment>
                                    );
                                }}
                        </Cell>
                    </Column>
                </Table>

                <Pagination
                    lengthMenu={[
                        {
                            value: 10,
                            label: 10
                        },
                        {
                            value: 20,
                            label: 20
                        }
                    ]}
                    activePage={page}
                    displayLength={displayLength}
                    total={this.state.data.length}
                    onChangePage={this.handleChangePage}
                    onChangeLength={this.handleChangeLength}
                />
            </React.Fragment>
        );

    }
}

export default AlertComponent;