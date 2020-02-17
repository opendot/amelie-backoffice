import React from 'react'
import { connect } from 'react-redux'
import dayjs from 'dayjs'
import classNames from 'classnames'
import MaterialIcon from "material-icons-react"
import SessionPlayer from '../SessionPlayer'
import TreeLengthPlot from '../TreeLengthPlot'
import DurationPlotCard from '../DurationPlotCard'
import {
  getSessionsForPlayer,
  loadSessionForPlayer,
  unloadSessionForPlayer,
} from '../../../state/patientDashboard'
import './SessionCardComunicator.scss'
import { formatTime } from '../../../utils'

class SessionCardComunicator extends React.PureComponent {
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
    const { session, patient, sessionsDetail, durationScale, expandedView, togglable } = this.props
    const { open } = this.state

    let sessionDetail = null
    if (sessionsDetail[session.id]) {
      sessionDetail = sessionsDetail[session.id]
    }
    let duration = null
    if (sessionDetail) {
      duration = formatTime(Math.round(sessionDetail.duration))
    }


    const valueDuration = durationScale && durationScale(sessionDetail.duration)

    return (
      <React.Fragment>
        <div className={classNames('SessionCardComunicator mt-4 p-3', {
          'rounded mb-2': !open,
          'rounded-top': open,
          'exercise-success-border': session.success,
          'exercise-unsuccess-border': !session.success,
        })}>
          <div className='row'>
            <div className='col-md-5 d-flex'>
              {togglable && <button
                type="button"
                onClick={this.toggleOpen}
                className="btn btn-white border rounded-circle button-circle-lg mr-2 d-flex">
                  <MaterialIcon icon={open ? 'remove' : 'add'} />
              </button>}
              <div className='ml-3'>
                <div className='exercise-title'>SESSIONE</div>
                <div className='exercise-name'><b>Sessione del {dayjs(session.start_time).format('DD/MM/YYYY')}</b></div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='exercise-title'>LUNGHEZZA ALBERO</div>
              <div className='exercise-value'>
                {session.number_of_levels} livelli
                <TreeLengthPlot
                  numberOfLevels={session.number_of_levels}
                />
              </div>
            </div>
            <div className='col-md-3'>
              <div className='exercise-title'>DURATA</div>
              <div className='exercise-value'>
                {duration}
                {durationScale &&
                  <DurationPlotCard
                    domain={[0,100]}
                    minDomain='0'
                    maxDomain={100}
                    range={[0,100]}
                    param={valueDuration}
                  />
                }
              </div>
            </div>
          </div>
        </div>
        {open && sessionDetail && <SessionPlayer
          expandedView={expandedView}
          sessionDetail={sessionDetail}
          patient={patient}
          session={session}
          communicator={true}
        />}
      </React.Fragment>
    )
  }
}

SessionCardComunicator.defaultProps = {
  expandedView: false,
}

export default connect(state => ({
  sessionsDetail: getSessionsForPlayer(state),
}), {
  loadSessionForPlayer,
  unloadSessionForPlayer,
})(SessionCardComunicator)
