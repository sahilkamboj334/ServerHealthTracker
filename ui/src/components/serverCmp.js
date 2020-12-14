import React from 'react';
import { notify } from '../services/notify';
import * as httpClient from '../services/httpSrv';
import { Button, Icon, Table, Modal, Row, Col, Input, Toggle, InputGroup,ButtonToolbar, ButtonGroup } from 'rsuite';
import ModalFooter from 'rsuite/lib/Modal/ModalFooter';
const { Column, HeaderCell, Cell, Pagination } = Table;



class ServerComponent extends React.Component {
  constructor() {
    super()
    this.state = {
      deleteLoader:false,
      ipForDelete:"",
      addModelOpen:false,
      deleteModelOpen:false,
      data: [],
      displayLength: 10,
      tableLoading: false,
      createReqLoading:false,
      page: 1,
      modelOpen: false,
      modelData: {
        name: "",
        ip: "",
        serviceUrl: "",
        isActive: false

      },
      serverObject: {
        name: "",
        ip: "",
        serviceUrl: "",
        isActive: false

      },
      requestOn:false
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
  //handle table tableLoading again
  updateRequest=()=>{
    console.log("Update Model data",this.state.modelData);
    this.setState({...this.state,requestOn:true});
    httpClient.post(process.env.REACT_APP_SERVER_BASE_URL+"server/update",this.state.modelData,(res)=>{
      this.setState({...this.state,requestOn:false,modelOpen:false,modelData:{
      name: "",
      ip: "",
      serviceUrl: "",
      isActive: false}});
      notify("success",res.data.message);
      this.refresh();
    });
  }

  deleteRequest=()=>{
    this.setState({...this.state,deleteLoader:true});
    httpClient.post(process.env.REACT_APP_SERVER_BASE_URL+"server/delete?ip="+this.state.ipForDelete,null,(res)=>{
      this.setState({...this.state,deleteLoader:false,ipForDelete:"",deleteModelOpen:false});
      notify("success",res.data.message);
      this.refresh();
    });
  }
 refresh=()=>{
  this.setState({
    ...this.state,
    tableLoading: true
  });
  httpClient.get(process.env.REACT_APP_SERVER_BASE_URL+"server/list", (res) => {
    this.setState({
      ...this.state,
      data: res.data,
      tableLoading: false
    })
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
  changeHandler=(v,event) =>{
      this.setState({
        serverObject:{...this.state.serverObject,[event.target.name]:event.target.value}
      });
  }
  process = () => {
    console.log(this.state.serverObject);
    if (this.state.serverObject.name.length <= 0 || this.state.serverObject.ip.length <= 0 || this.state.serverObject.serviceUrl.length <= 0) {
      notify("error", "All Fields are required!");
      return
    }
    let exp=new RegExp("^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
    if (!exp.test(this.state.serverObject.ip)) {
      notify("error", "Ip Address is not valid!");
      return
    }
    this.setState({...this.state,createReqLoading:true});
    httpClient.post(process.env.REACT_APP_SERVER_BASE_URL+"server/add",this.state.serverObject,(res)=>{
      this.setState({...this.state,createReqLoading:false,addModelOpen:false,serverObject:{
      name: "",
      ip: "",
      serviceUrl: "",
      isActive: false}});
      notify("success",res.data.message);
      this.refresh();
    });

  }
  DeleteModel=()=>{
    return(
      <Modal backdrop="static" show={this.state.deleteModelOpen} onHide={()=>{this.setState({...this.state,deleteModelOpen:false})}}>
        <Modal.Header>
          <Modal.Title><Icon icon="warning" style={{color:"red"}}/></Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: "hidden" }}>
          Are you sure ?
        </Modal.Body>
        <ModalFooter>
          <ButtonGroup>
              <Button appearance="subtle" style={{backgroundColor:"red",color:"white"}} onClick={this.deleteRequest} loading={this.state.deleteLoader}>Yes</Button>
              <Button appearance="subtle" onClick={()=>{this.setState({...this.state,deleteModelOpen:false})}}><Icon icon="close"/>No</Button>
          </ButtonGroup>
        </ModalFooter>
        </Modal>
    );
  }

  AddModel=()=>{
    return (
      <React.Fragment>
      <Row style={{ marginBottom: 10}}>
      <ButtonToolbar>
        <Button onClick={()=>{this.setState({...this.state,addModelOpen:true})}} appearance="primary" style={{marginTop: 10, marginRight: 10, float: "right" }}><Icon icon="plus-circle" /> Add</Button>
      </ButtonToolbar>
      </Row>
      <Modal backdrop="static" show={this.state.addModelOpen} onHide={()=>{this.setState({...this.state,addModelOpen:false})}}>
        <Modal.Header>
          <Modal.Title>Configure New Machine</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: "hidden" }}>
          <Row style={{ marginBottom: 10 }}>
            <Col xs={24} sm={12} md={12}>
              <Input placeholder="Machine Name*" type="text" name="name" value={this.state.serverObject.name} onChange={(_, event) => { this.changeHandler(_,event) }} />
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Input placeholder="Machine IP*" type="text" name="ip" value={this.state.serverObject.ip} onChange={(_, event) => { this.changeHandler(_,event) }} />
            </Col>
          </Row>
          <Row style={{ marginBottom: 10 }}>
            <Col xs={24} sm={12} md={12}>
              <Input placeholder="Web Service URL*" type="text" name="serviceUrl" value={this.state.serverObject.serviceUrl} onChange={(_, event) => { this.changeHandler(_,event) }} />
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Toggle size="md" checkedChildren="Active" unCheckedChildren="InActive" onChange={(_, event) => {this.setState({ serverObject:{...this.state.serverObject,isActive:_}})}} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.process} appearance="primary" loading={this.state.createReqLoading}>
            <Icon icon="save" /> Add
            </Button>
          <Button onClick={()=>{this.setState({...this.state,addModelOpen:false})}} appearance="subtle">
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
          <Column flexGrow={1} fixed>
            <HeaderCell>Machine Name</HeaderCell>
            <Cell dataKey="name" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>Machine IP</HeaderCell>
            <Cell dataKey="ip" />
          </Column>

          <Column flexGrow={2}>
            <HeaderCell>Web Service Url</HeaderCell>
            <Cell dataKey="serviceUrl" />
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
                      <Button appearance="subtle" onClick={() => {this.setState({ ...this.state, deleteModelOpen: true, ipForDelete:rowData.ip})}}><Icon icon="trash" style={{ color: "blue" }}></Icon></Button>
                      <this.DeleteModel></this.DeleteModel>
                      <Modal backdrop="static" show={this.state.modelOpen} onHide={() => { this.setState({ ...this.state, modelOpen: false }) }}>
                        <Modal.Header>
                          <Modal.Title>Edit Machine</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ overflow: "hidden" }}>
                          <Row style={{ marginBottom: 10 }}>
                            <Col xs={24} sm={12} md={12}>
                              <InputGroup>
                                <InputGroup.Addon>Name</InputGroup.Addon>
                                <Input type="text" name="name" value={this.state.modelData.name} onChange={(_, e) => { this.setState({ modelData: { ...this.state.modelData, [e.target.name]: e.target.value } }) }} />
                              </InputGroup>
                            </Col>
                            <Col xs={24} sm={12} md={12}>
                              <InputGroup>
                                <InputGroup.Addon>IP</InputGroup.Addon>
                                <Input type="text" name="ip" value={this.state.modelData.ip} onChange={(_, e) => { this.setState({ modelData: { ...this.state.modelData, [e.target.name]: e.target.value } }) }} />
                              </InputGroup>
                            </Col>
                          </Row>
                          <Row style={{ marginBottom: 10 }}>
                            <Col xs={24} sm={12} md={12}>
                              <InputGroup>
                                <InputGroup.Addon>Url</InputGroup.Addon>
                                <Input type="text" name="serviceUrl" value={this.state.modelData.serviceUrl} onChange={(_, e) => { this.setState({ modelData: { ...this.state.modelData, [e.target.name]: e.target.value } }) }} />
                              </InputGroup>
                            </Col>
                            <Col xs={24} sm={12} md={12}>
                              <InputGroup>
                                <InputGroup.Addon>Status</InputGroup.Addon>
                                <Toggle style={{ marginTop: 3 }} size="md" checked={this.state.modelData.isActive} checkedChildren="Active" unCheckedChildren="InActive" onChange={(_, e) => { this.setState({ modelData: { ...this.state.modelData, isActive: _ } }) }} />
                              </InputGroup>
                            </Col>
                          </Row>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button appearance="primary" onClick={this.updateRequest} loading={this.state.requestOn}>
                            <Icon icon="refresh" /> Update
                                              </Button>
                          <Button appearance="subtle" onClick={()=>{this.setState({...this.state,modelOpen:false})}}>
                          <Icon icon="close"/> Cancel
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

export default ServerComponent;