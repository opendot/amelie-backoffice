import React from 'react'
import { connect } from 'react-redux'
import { AuthRoute } from 'eazy-auth'
import { Switch, Route } from 'react-router-dom'
import { loadPatient, unloadPatient, getPatient } from '../../state/patients'
import CareReceiverDetail from './CareReceiverDetail'
import PCDashboard from './PCDashboard'
import PCEditProgress from './PCEditProgress'

import Comunicator from './Comunicator'
import ExerciseDetail from './ExerciseDetail'

class CareReceiverDashboard extends React.Component {
  componentDidMount() {
    this.props.loadPatient({ id: this.props.match.params.id })
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.props.unloadPatient()
      this.props.loadPatient({ id: this.props.match.params.id })
    }
  }

  componentWillUnmount() {
    // console.log('Unload CareReceiverDashboard')
    // FIXME: This breaks the animations.....
    // this.props.unloadPatient()
  }

  render() {
    const { patient, match } = this.props

    if (patient === null) {
      return null
    }

    return (
      <Switch>
        <Route path={`${match.path}`} exact component={CareReceiverDetail} />
        <Route path={`${match.path}/potenziamento-cognitivo`} exact component={PCDashboard} />
        <Route path={`${match.path}/edit-progress`} exact component={PCEditProgress} />
        <Route path={`${match.path}/comunicatore`} exact component={Comunicator} />
        <AuthRoute
          redirectTest={user => {
            if (user.type === 'Superadmin' || user.type === 'Researcher') {
              return false
            }
            return {
              pathname: "/dashboard",
              state: {
                preventAnimation: true
              }
            }
          }}
          path={`${match.path}/exercise/:exerciseId`} exact component={ExerciseDetail} />
      </Switch>
    )
  }
}

export default connect(state => ({
  patient: getPatient(state),
}), {
  loadPatient,
  unloadPatient,
})(CareReceiverDashboard)
