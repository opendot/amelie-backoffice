import React from 'react'
import { getAuthUser } from 'eazy-auth'
import memoize from 'memoize-one'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import orderBy from 'lodash/orderBy'
import { scaleLinear } from 'd3'
import {
  loadPatientStats,
  unloadPatientStats,
  getPatientStats,
  loadComunicativeSessions,
  unloadComunicativeSessions,
  getSessionsForPlayer,
  getComunicativeSessions,
} from '../../state/patientDashboard'
import { getPatient } from '../../state/patients'
import SessionsBarChartPotenziamento from '../../components/Dashboard/SessionsBarChartPotenziamento'
import SessionCardComunicator from '../../components/Dashboard/SessionCardComunicator'
import './Comunicator.scss'

class Comunicator extends React.Component {
  state = {
    daysSelect: 30,
    sortSessions: 'desc',
    expandedView: false,
  }

  componentDidMount() {
    const { patient } = this.props
    const days = this.state.daysSelect
    this.props.loadPatientStats(patient.id, days)
    this.props.loadComunicativeSessions(patient.id)
  }

  handleChangeDays = days => {
    const { patient } = this.props
    this.setState({ daysSelect : days})
    this.props.loadPatientStats(patient.id, days)
  }

  componentWillUnmount() {
    this.props.unloadPatientStats()
    this.props.unloadComunicativeSessions()
  }

  getSortedSessions = memoize((sessions, sort) => {
    if (sessions === null) {
      return null
    }
    return orderBy(sessions, ['start_time'], [sort])
  })

  getDurationScale = memoize((sessions, sessionsDetail) => {
    if (sessions) {
      const allDurations = sessions.map(session => {
        const sessionDetail = sessionsDetail[session.id]
        if (sessionDetail) {
          return sessionDetail.duration || 0
        }
        return null
      })

      if (allDurations.every(s => s !== null)) {
        const duration = Math.max(...allDurations)
        const scale = scaleLinear().domain([0, duration]).range([0, 100])
        return scale
      }
    }
    return null
  })

  render() {
    const { patient, stats, sessions, sessionsDetail, user } = this.props

    const durationScale = this.getDurationScale(sessions, sessionsDetail)
    const sortedSessions = this.getSortedSessions(sessions, this.state.sortSessions)

    const togglable = (
      user.type === 'Superadmin' ||
      user.type === 'Researcher'
    )

    return (
      <div className='Comunicator p-2'>
        <nav aria-label="breadcrumb" className="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to='/dashboard'>Dashboard dati</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/dashboard/care-receiver/${patient.id}`}>Care Receiver: {patient.name}{' '}{patient.surname}</Link>
            </li>
            <li className="breadcrumb-item">Comunicatore</li>
          </ol>
        </nav>
        <div className='container-fluid'>
          {/* Top Stats  */}
          <h5>Riassunto degli
            <select
              className='selectDays'
              defaultValue={this.state.daysSelect}
              onChange={(e) => this.handleChangeDays(e.target.value)}>
              <option value="15">ultimi 15 giorni con sessioni</option>
              <option value="30">ultimi 30 giorni con sessioni</option>
              <option value="60">ultimi 60 giorni con sessioni</option>
            </select>
          </h5>
          {stats &&
            <div className='block-plots p-2'>
              <div className='row block-resume'>
                <div className='col-md-3 pt-2'>
                  <div className='title-block'>Sessioni effettuate</div>
                  <div className='big-value'>{stats.communication_sessions.count.count}</div>
                  <div className='percentage-increment'>
                    {stats.communication_sessions.count.average > 0  &&
                      <span><span className='green-percentage'>+ {stats.communication_sessions.count.average} % </span><span>del periodo precedente</span></span>
                    }
                    {stats.communication_sessions.count.average < 0  &&
                      <span><span className='red-percentage'>- {stats.communication_sessions.count.average} % </span><span>del periodo precedente</span></span>
                    }
                  </div>
                </div>
                <div className='col-md-9'>
                  {stats && <SessionsBarChartPotenziamento
                    patient={patient}
                    data={stats.communication_sessions.count.data}
                    ticks={[0,2,4,6]}
                    paramY={'count'}
                  />}
                </div>
              </div>
            </div>}
            {/* Sessions  */}
            <div className='mt-4 d-flex justify-content-between align-items-center'>
              <div>
                <h4>Sessioni comunicatore</h4>
              </div>

              <div>
                <select
                  defaultValue={this.state.sortSessions}
                  onChange={(e) => this.setState({
                    sortSessions: e.target.value,
                  })}>
                  <option value='asc'>dal meno al più recente</option>
                  <option value='desc'>dal più al meno recente</option>
                </select>
              </div>

              <div className='d-flex text-filters-view justify-content-end text-right'>
                <div className='mr-2'>Vista compatta</div>
                <div className='mr-2'>
                  <input
                    type="checkbox"
                    className="switch"
                    checked={this.state.expandedView}
                    onChange={() => this.setState({expandedView: !this.state.expandedView})}
                  />
                </div>
                <div>Vista espansa</div>
              </div>

            </div>
            {sortedSessions && (
              <div>
                {sortedSessions.map(session => (
                  <SessionCardComunicator
                    togglable={togglable}
                    durationScale={durationScale}
                    expandedView={this.state.expandedView}
                    key={session.id}
                    patient={patient}
                    session={session}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    )
  }
}


export default connect(state => ({
  user: getAuthUser(state),
  patient: getPatient(state),
  stats: getPatientStats(state),
  sessions: getComunicativeSessions(state),
  sessionsDetail: getSessionsForPlayer(state),
}),
{
  loadPatientStats,
  unloadPatientStats,
  loadComunicativeSessions,
  unloadComunicativeSessions,
})(Comunicator)
