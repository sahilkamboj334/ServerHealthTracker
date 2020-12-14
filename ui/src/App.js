import React, { useState } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Navbar, Nav, Icon, Container, Content } from "rsuite";
import 'rsuite/dist/styles/rsuite-default.css';
import ServerComponent from './components/serverCmp';
import Reports from './components/reports';
import LiveReport from './components/live-report';
import AlertComponent from './components/alert-manager-cmp';
function App() {
  let [active, setActive] = useState("1");
  let handleSelect = (e) => {
    setActive(e.eventKey);
  }
  return (
    <Router>
      <Container>
        <Navbar appearance="inverse">
          <Navbar.Body>
            <Nav onSelect={handleSelect} activeKey={active}>
              <Nav.Item eventKey="1" componentClass={Link} to="/" icon={<Icon icon="server" />} >
                <b>Servers</b>
              </Nav.Item>
              <Nav.Item eventKey="2" componentClass={Link} to="/reports" icon={<Icon icon="trend" />} >
                <b>Reports</b>
              </Nav.Item>
              <Nav.Item eventKey="3" componentClass={Link} to="/live-reporting" icon={<Icon icon="logo-analytics" />} >
                <b>Live/Real Time Analysis</b>
              </Nav.Item>
              <Nav.Item eventKey="4" componentClass={Link} to="/alert-manager" icon={<Icon icon="gear-circle" />} >
                <b>Alert Management</b>
              </Nav.Item>
            </Nav>
          </Navbar.Body>
        </Navbar>
        <Content style={{overflow:"hidden"}}>
          <Switch>
            <Route exact path="/">
              <ServerComponent />
            </Route>
            <Route path="/reports">
              <Reports />
            </Route>
            <Route path="/live-reporting">
              <LiveReport />
            </Route>
            <Route path="/alert-manager">
              <AlertComponent />
            </Route>
          </Switch>
        </Content>
      </Container>
    </Router>

  );
}

export default App;
