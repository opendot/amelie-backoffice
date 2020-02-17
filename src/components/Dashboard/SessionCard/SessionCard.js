import React from 'react'
import { connect } from 'react-redux'
import dayjs from 'dayjs'
import classNames from 'classnames'
import MaterialIcon from "material-icons-react"
import SessionPlayer from '../SessionPlayer'
import {
  getSessionsForPlayer,
  loadSessionForPlayer,
  unloadSessionForPlayer,
} from '../../../state/patientDashboard'
import './SessionCard.scss'

class SessionCard extends React.PureComponent {
  state = {
    open: false,
  }

  componentDidMount() {
    this.loadSessionDetail()
  }

  componentDidUpdate(prevProps) {
    if (this.props.session !== prevProps.session && this.props.session) {
      this.loadSessionDetail()
    }
  }

  componentWillUnmount() {
    const { session } = this.props
    if (session) {
      this.props.unloadSessionForPlayer(session.id)
    }
  }

  loadSessionDetail = () => {
    const { session, patient, sessionsDetail } = this.props
    if (!sessionsDetail[session.id]) {
      this.props.loadSessionForPlayer(patient.id, session.id)
    }
  }

  toggleOpen = () => this.setState({
    open: !this.state.open,
  })

  render() {
    const { session, patient, exercise, sessionsDetail, expandedView } = this.props
    const { open } = this.state

    let sessionDetail = null
    if (sessionsDetail[session.id]) {
      sessionDetail = sessionsDetail[session.id]
    }

    return (
      <React.Fragment>
        <div className={classNames('SessionCard mt-4 p-3', {
          'rounded mb-2': !open,
          'rounded-top': open,
          'exercise-success-border': session.success,
          'exercise-unsuccess-border': !session.success,
        })}>
          <div className='row'>
            <div className='col-md-4 d-flex'>
              <button
                type="button"
                onClick={this.toggleOpen}
                className="btn btn-white border rounded-circle button-circle-lg mr-2 d-flex">
                  <MaterialIcon icon={open ? 'remove' : 'add'} />
              </button>
              <div className='ml-3'>
                <div className='exercise-title'>SESSIONE</div>
                <div className='exercise-name'><b>Sessione del {dayjs(session.start_time).format('DD/MM/YYYY')}</b></div>
              </div>
            </div>
            <div className='col-md-2'>
              <div className='exercise-title'>STATO</div>
              <div className='exercise-value'>{session.success ? 'Superato' : 'Non superato'}</div>
            </div>
            <div className='col-md-3'>
              <div className='exercise-title'>RISPOSTE CORRETTE</div>
              <div className='d-flex mt-2'>
                {sessionDetail && sessionDetail.steps.map((step, i) => (
                  <div
                    style={{ marginLeft: 1 }}
                    key={i}
                    className={classNames('rounded-circle text-white d-flex', {
                      'bg-dashboard-green': step.correct,
                      'bg-dashboard-red': !step.correct,
                    })}
                  >
                      <MaterialIcon icon={step.correct ? 'done' : 'clear'} size={12} color='white' />
                  </div>
                ))}
              </div>
            </div>
            <div className='col-md-3'>
              <div className='exercise-title'>VELOCITÀ MEDIA DI SELEZIONE</div>
              <div className='exercise-value'>
                {(session.average_selection_speed_ms / 1000).toFixed(1)} secondi
              </div>
            </div>
          </div>
        </div>
        {open && sessionDetail && <SessionPlayer
          expandedView={expandedView}
          sessionDetail={sessionDetail}
          exercise={exercise}
          patient={patient}
          session={session}
        />}
      </React.Fragment>
    )
  }
}

SessionCard.defaultProps = {
  expandedView: false,
}

export default connect(state => ({
  sessionsDetail: getSessionsForPlayer(state),
}), {
  loadSessionForPlayer,
  unloadSessionForPlayer,
})(SessionCard)
