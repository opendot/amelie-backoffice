import React from 'react'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import MaterialIcon from "material-icons-react";
import qs from 'query-string'
import {
  loadPatientWidgets,
  unloadPatientWidgets,
  getPatientWidgets,
  loadPatientActivities,
  unloadPatientActivities,
  getPatientActivities,
} from '../../state/patientDashboard'
import { getPatient } from '../../state/patients'
import ChartAdvancement from '../../components/Dashboard/ChartAdvancement'
import SessionsBarChart from '../../components/Dashboard/SessionsBarChart'
import LastBadge from '../../components/Dashboard/LastBadge'
import { DATE_FORMAT } from '../../consts'
import './CareReceiverDetail.scss'

function PatientWidgets({ patient, widgets, className = '' }) {
  return (
    <div>
    <div className={`row mt-3 mb-4 ${className}`}>
      <div className='col-md-6'>
        <h2>Potenziamento cognitivo</h2>
        <div className='row mt-4'>
          <div className='col-md-6'>
            <div className='rounded border p-3 block-care'>
              <div className='title-block'>Avanzamento</div>
                {widgets && widgets.cognitive_sessions.progress.map(level => (
                  <ChartAdvancement
                    domain={[0,level.exercises_total]}
                    key={level.level_id}
                    minDomain='0'
                    maxDomain={level.exercises_total}
                    range={[0,100]}
                    param={level.exercises_completed}
                    label={'Livello '+level.level_name}
                  />
                ))}
            </div>
          </div>
          <div className='col-md-6'>
            <div className='rounded border p-3 block-care'>
              <div className='title-block'>Ultimo traguardo</div>
              <div className='description-block mt-2'>
                {widgets &&
                  <LastBadge
                    lastBadge={widgets.cognitive_sessions.last_badge}
                    patientName={patient.name + ' ' + patient.surname}
                  />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='col-md-6'>
        <h2>Comunicatore</h2>
        <div className='row mt-4'>
          <div className='col-md-6'>
            <div className='rounded border p-3 block-care'>
              <div className='title-block'>Sessioni svolte</div>
              <div className='big-value'>
                {widgets && widgets.communication_sessions.sessions_count}
              </div>
            </div>
          </div>
          <div className='col-md-6'>
            <div className='rounded border p-3 block-care'>
              <div className='title-block'>Velocità media di selezione</div>
              <div className='big-value'>
                {widgets && (widgets.communication_sessions.average_selection_speed_ms / 1000).toFixed(2)}
                <small>secondi</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className='row'>
      <div className='col-md-6'>
        <Link
          className='btn btn-secondary btn-block p-3'
          to={`/dashboard/care-receiver/${patient.id}/potenziamento-cognitivo`}>Scopri di più</Link>
      </div>
      <div className='col-md-6'>
        <Link
          className='btn btn-secondary btn-block p-3'
          to={`/dashboard/care-receiver/${patient.id}/comunicatore`}>Scopri di più</Link>
      </div>
    </div>
  </div>
  )
}

class CareReceiverDetail extends React.Component {
  componentDidMount() {
    // Load patient widgets...
    this.props.loadPatientWidgets(this.props.match.params.id)

    const { from_date, to_date } = this.getFromToDates(this.props.location.search)
    this.props.loadPatientActivities(this.props.match.params.id, {
      from_date: from_date.format(DATE_FORMAT),
      to_date: to_date.format(DATE_FORMAT),
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      const { from_date, to_date } = this.getFromToDates(this.props.location.search)
      const { from_date: prev_from, to_date: prev_to } = this.getFromToDates(prevProps.location.search)
      if (!from_date.isSame(prev_from) || !to_date.isSame(prev_to)) {
        this.props.loadPatientActivities(this.props.match.params.id, {
          from_date: from_date.format(DATE_FORMAT),
          to_date: to_date.format(DATE_FORMAT),
        })
      }
    }
  }

  componentWillUnmount() {
    this.props.unloadPatientWidgets()
    this.props.unloadPatientActivities()
  }

  getFromToDates = (search) => {
    const queryParams = qs.parse(search)

    let { from_date, to_date } = queryParams

    from_date = dayjs(from_date, DATE_FORMAT)
    to_date = dayjs(to_date, DATE_FORMAT)

    // TODO: Validate also the distance between 2 dates
    if (!from_date.isValid() || !to_date.isValid()) {
      from_date = dayjs().startOf('month')
      to_date = dayjs().endOf('month')
    }
    return { from_date, to_date }
  }

  goNext = () => {
    const { from_date } = this.getFromToDates(this.props.location.search)
    const nextFrom = from_date.endOf('month').add(1, 'day')
    const nextTo = nextFrom.endOf('month')

    this.props.history.push(this.props.location.pathname + '?' + qs.stringify({
      from_date: nextFrom.format(DATE_FORMAT),
      to_date: nextTo.format(DATE_FORMAT)
    }), {
      preventAnimation: true
    })
  }

  goPrev = () => {
    const { from_date } = this.getFromToDates(this.props.location.search)
    const nextFrom = from_date.startOf('month').subtract(1, 'day').startOf('month')
    const nextTo = nextFrom.endOf('month')

    this.props.history.push(this.props.location.pathname + '?' + qs.stringify({
      from_date: nextFrom.format(DATE_FORMAT),
      to_date: nextTo.format(DATE_FORMAT)
    }), {
      preventAnimation: true
    })
  }

  render() {
    const { widgets, patient, location, sessions } = this.props
    const { from_date, to_date } = this.getFromToDates(location.search)
    const currentMonthYear = dayjs().format('MM YYYY')

    return (
      <div className='CareReceiverDetail p-2'>
        <nav aria-label="breadcrumb" className="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to='/dashboard'>Dashboard dati</Link>
            </li>
            <li className="breadcrumb-item">Care Receiver: {patient.name}{' '}{patient.surname}</li>
          </ol>
        </nav>
        <div className='container-fluid'>
          <div className='d-flex justify-content-between'>
            <div />
            <div className='d-flex date-filters'>
              <div>{from_date.format('DD MMMM YYYY')}</div>
              {' - '}
              <div className=''>{to_date.format('DD MMMM YYYY')}</div>
              {' '}
              <span className='pointer' onClick={this.goPrev}>
                <MaterialIcon
                  icon="keyboard_arrow_left"
                  // color={styles.iconColor}
                />
              </span>
              <span className={classNames({
                'no-clickable-month': to_date.format('MM YYYY') === currentMonthYear,
                'pointer': to_date.format('MM YYYY') !== currentMonthYear,
                })} onClick={this.goNext}>
                <MaterialIcon
                  icon="keyboard_arrow_right"
                />
              </span>
            </div>
          </div>
          <SessionsBarChart
            patient={patient}
            sessions={sessions}
          />
          {widgets && <PatientWidgets widgets={widgets} patient={patient} />}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  patient: getPatient(state),
  widgets: getPatientWidgets(state),
  sessions: getPatientActivities(state),
}), {
  loadPatientActivities,
  loadPatientWidgets,
  unloadPatientWidgets,
  unloadPatientActivities,
})(CareReceiverDetail)
