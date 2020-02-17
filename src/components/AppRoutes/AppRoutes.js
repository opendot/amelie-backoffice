import React from "react";
import { connect } from "react-redux";
import { Route, Redirect, withRouter, Switch } from "react-router-dom";
import { AuthRoute, GuestRoute } from "eazy-auth";
import Landing from "../../pages/Landing";
import PotenziamentoCognitivo from "../../pages/PotenziamentoCognitivo";
import Libreria from "../../pages/Libreria";
import GestioneUtenti from "../../pages/GestioneUtenti";
import UserDetail from "../../pages/UserDetail";
import PatientDetail from "../../pages/PatientDetail";
import Login from "../../pages/Login";
import Level from "../../pages/Level";
import Box from "../../pages/Box";
import Target from "../../pages/Target";
import LayoutWebsite from "../../pages/LayoutWebsite";
import Home from "../../pages/Home";
import Project from "../../pages/Project";
import Dashboard from "../../pages/Dashboard/Dashboard";
import CareReceiverDashboard from "../../pages/Dashboard/CareReceiverDashboard";
import Impostazioni from "../../pages/Impostazioni";
import Notifiche from "../../pages/Notifiche";
import PackageDownload from "../../pages/PackageDownload";
import Routes from "../Routes";
import Breadcrumb from "../PCBreadcrumb";
import { loadLevel } from "../../state/levels";
import { loadBox } from "../../state/boxes";
import RecoverPasswordForm from "../RecoverPasswordForm";

class PotenziamentoCognitivoBoxRoutes_ extends React.PureComponent {
  componentDidMount() {
    this.props.loadBox({
      id: this.props.match.params.boxId,
      levelId: this.props.match.params.levelId
    });
  }

  render() {
    return (
      <Switch>
        <Route
          path="/potenziamento-cognitivo/level/:levelId/box/:boxId"
          exact
          component={Box}
        />
        <Route
          path="/potenziamento-cognitivo/level/:levelId/box/:boxId/target/:targetId"
          exact
          component={Target}
        />
      </Switch>
    );
  }
}
const PotenziamentoCognitivoBoxRoutes = connect(
  undefined,
  { loadBox }
)(PotenziamentoCognitivoBoxRoutes_);

class PotenziamentoCognitivoLevelRoutes_ extends React.PureComponent {
  componentDidMount() {
    this.props.loadLevel({ id: this.props.match.params.levelId });
  }

  render() {
    return (
      <Switch>
        <Route
          path="/potenziamento-cognitivo/level/:levelId"
          exact
          component={Level}
        />
        <Route
          path="/potenziamento-cognitivo/level/:levelId/box/:boxId"
          component={PotenziamentoCognitivoBoxRoutes}
        />
      </Switch>
    );
  }
}
const PotenziamentoCognitivoLevelRoutes = connect(
  undefined,
  { loadLevel }
)(PotenziamentoCognitivoLevelRoutes_);

const PotenziamentoCognitivoRoutes = () => (
  <Switch>
    <Route
      path="/potenziamento-cognitivo"
      exact
      component={PotenziamentoCognitivo}
    />
    <Route
      path="/potenziamento-cognitivo/level/:levelId"
      component={PotenziamentoCognitivoLevelRoutes}
    />
  </Switch>
);

const AppRoutes = () => (
  <React.Fragment>
    <Switch>
      <Route path="/potenziamento-cognitivo" exact component={Breadcrumb} />
      <Route
        path="/potenziamento-cognitivo/level/:levelId"
        exact
        component={Breadcrumb}
      />
      <Route
        path="/potenziamento-cognitivo/level/:levelId/box/:boxId"
        exact
        component={Breadcrumb}
      />
      <Route
        path="/potenziamento-cognitivo/level/:levelId/box/:boxId/target/:targetId"
        exact
        component={Breadcrumb}
      />
    </Switch>

    <Routes>
      {/* <Route
        path="/"
        exact
        render={() => (
          <LayoutWebsite>
            <Home />
          </LayoutWebsite>
        )}
      />
      <Route
        path="/progetto"
        exact
        render={() => (
          <LayoutWebsite>
            <Project />
          </LayoutWebsite>
        )}
      /> */}
      <AuthRoute
        path="/potenziamento-cognitivo"
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={PotenziamentoCognitivoRoutes}
      />
      <AuthRoute
        path="/potenziamento-cognitivo"
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={PotenziamentoCognitivoRoutes}
      />
      <AuthRoute
        path="/libreria/:tabName?"
        exact
        component={Libreria}
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
      />

      <AuthRoute
        path="/home"
        exact
        component={Landing}
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
      />

      <AuthRoute
        path="/gestione-utenti"
        exact
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={GestioneUtenti}
      />

      <AuthRoute
        path="/gestione-utenti/:userId"
        exact
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={UserDetail}
      />

      <AuthRoute
        path="/gestione-utenti/pazienti/:patientId"
        exact
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={PatientDetail}
      />

      <AuthRoute
        path="/impostazioni"
        exact
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={Impostazioni}
      />

      <AuthRoute
        path="/dashboard"
        exact
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={Dashboard}
      />

      <AuthRoute
        path="/dashboard/care-receiver/:id"
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        component={CareReceiverDashboard}
      />

      <AuthRoute
        path="/notifiche"
        exact
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        redirectTest={
          user => user.type === 'Parent'
          ? false
          : {
            pathname: "/home",
            state: {
              preventAnimation: true
            }
          }
        }
        component={Notifiche}
      />

      <AuthRoute
        path="/package-download"
        exact
        redirectTo={{
          pathname: "/login",
          state: {
            preventAnimation: true
          }
        }}
        redirectTest={
          user => (user.type === 'Researcher' || user.type === 'Superadmin')
          ? false
          : {
            pathname: "/home",
            state: {
              preventAnimation: true
            }
          }
        }
        component={PackageDownload}
      />

      <Redirect
        exact
        from="/"
        to={{
          pathname: "/home",
          state: {
            preventAnimation: true
          }
        }}></Redirect>



      <GuestRoute path="/login" exact component={Login} />
        <GuestRoute path="/recover" exact component={RecoverPasswordForm} />
    </Routes>
  </React.Fragment>
);

export default withRouter(AppRoutes);
