import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import memoize from 'memoize-one'
import { getAuthUser } from 'eazy-auth'
import {
  loadPatientStats,
  unloadPatientStats,
  getPatientStats,
  loadPatientBadges,
  unloadPatientBadges,
  getPatientBadges,
  getPatientAvailableLevels,
  loadPatientAvailableLevels,
  unloadPatientAvailableLevels,
  loadAvailableExerciseTrees,
  unloadAvailableExerciseTrees,
  getAvailableExerciseTreesGrouped,
  getSessionsExtent,
} from '../../state/patientDashboard'
import { getPatient } from '../../state/patients'
import SessionsBarChartPotenziamento from '../../components/Dashboard/SessionsBarChartPotenziamento'
import PCLevelCard from '../../components/Dashboard/PCLevelCard'
import BadgesCarousel from '../../components/Dashboard/BadgesCarousel'
import AverageSpeedOfSelection from '../../components/Dashboard/AverageSpeedOfSelection'
import './PcDashboard.scss'

class PCDashboard extends React.Component {
  state = {
    levelOpen: null,
    daysSelect: 30,
  }

  componentDidMount() {
    const { patient } = this.props
    const days = this.state.daysSelect
    this.props.loadPatientStats(patient.id, days)
    this.props.loadPatientBadges(patient.id)
    this.props.loadPatientAvailableLevels(patient.id)
  }

  handleChangeDays = days => {
    const { patient } = this.props
    this.setState({ daysSelect : days})
    this.props.loadPatientStats(patient.id, days)
  }

  componentWillUnmount() {
    this.props.unloadPatientStats()
    this.props.unloadPatientBadges()
    //this.props.unloadPatientAvailableLevels()
    //this.props.unloadAvailableExerciseTrees()
  }

  toggleLevelOpen = level => {
    const { patient } = this.props

    this.props.unloadAvailableExerciseTrees()
    if (this.state.levelOpen === level.level_id) {
      this.setState({ levelOpen: null })
    } else {
      this.props.loadAvailableExerciseTrees(patient.id, level.level_id)
      this.setState({ levelOpen: level.level_id })
    }
  }

  getCorrectAnswers = memoize((data) => data.map((answer) => {
    return {
      date: answer.date,
      percentage: (answer.percentage * 100).toFixed(0)
    }
  }))

  getAverageSpeed = memoize((data) => data.map((speed) => {
    return {
      date: speed.date,
      seconds: (speed.millis / 1000).toFixed(0)
    }
  }))

  render() {
    const { patient, stats, badges, availableLevels, availableExerciseTrees, sessionsExtent, user } = this.props
    const { levelOpen } = this.state
    // console.log('~', { stats, badges, availableLevels, availableExerciseTrees })
    const correct_answers = stats && this.getCorrectAnswers(stats.cognitive_sessions.correct_answers.data)
    const data_average_speed = stats && this.getAverageSpeed(stats.cognitive_sessions.average_selection_speed.data)

    const showExerciseLink = (
      user.type === 'Superadmin' ||
      user.type === 'Researcher'
    )

    return (
      <div className='PcDashboard p-2'>
        <nav aria-label="breadcrumb" className="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to='/dashboard'>Dashboard dati</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/dashboard/care-receiver/${patient.id}`}>Care Receiver: {patient.name}{' '}{patient.surname}</Link>
            </li>
            <li className="breadcrumb-item">Potenziamento Cognitivo</li>
          </ol>
        </nav>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-md-5'>
              <h5>Ultimi traguardi raggiunti da: {patient.name}</h5>
              <div className='block-plots'>
                {badges &&
                <BadgesCarousel
                  badges={badges}
                  patient={patient}
                />
                }
              </div>
            </div>
            <div className='col-md-7'>
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
              <React.Fragment>
              <div className='block-plots p-3'>
                <div className='row block-resume'>
                  <div className='col-md-3 pt-2'>
                    <div className='title-block'>RISPOSTE ESATTE</div>
                    <div className='big-value'>{(stats.cognitive_sessions.correct_answers.percentage *100).toFixed(0)} %</div>
                    <div className='percentage-increment'>
                      {stats.cognitive_sessions.correct_answers.difference && <div><span className='green-percentage'>+ {stats.cognitive_sessions.correct_answers.difference} % </span>{' '}del solito</div>}
                    </div>
                  </div>
                  <div className='col-md-9'>
                    {correct_answers && <SessionsBarChartPotenziamento
                      barBg
                      patient={patient}
                      data={correct_answers}
                      ticks={[0,50,100]}
                      paramY={'percentage'}
                    />}
                  </div>
                </div>
                <div className='row block-resume'>
                  <div className='col-md-3 pt-2'>
                    <div className='title-block'>Sessioni effettuate</div>
                    <div className='big-value'>{stats.cognitive_sessions.count.count}</div>
                    <div className='percentage-increment'>
                      {stats.cognitive_sessions.count.average} sessioni al giorno di media
                    </div>
                  </div>
                  <div className='col-md-9'>
                    {stats && <SessionsBarChartPotenziamento
                      patient={patient}
                      data={stats.cognitive_sessions.count.data}
                      ticks={[0,2,4,6]}
                      paramY={'count'}
                    />}
                  </div>
                </div>
                <div className='row'>
                  <div className='col-md-3 pt-2'>
                    <div className='title-block'>Velocità media di selezione</div>
                    <div className='big-value'>{(stats.cognitive_sessions.average_selection_speed.millis/1000).toFixed(1)} <small>secondi</small></div>
                    <div className='percentage-increment'>
                      {stats.cognitive_sessions.average_selection_speed.difference > 0  &&
                        <span><span className='green-percentage'>+ {stats.cognitive_sessions.average_selection_speed.difference} % </span><span>del solito</span></span>
                      }
                      {stats.cognitive_sessions.average_selection_speed.difference < 0  &&
                        <span><span className='red-percentage'>- {stats.cognitive_sessions.average_selection_speed.difference} % </span><span>del solito</span></span>
                      }
                    </div>
                  </div>
                  <div className='col-md-9'>
                    {stats && <AverageSpeedOfSelection
                      data={data_average_speed}
                      patient={patient}
                      media={(stats.cognitive_sessions.average_selection_speed.millis/1000).toFixed(1)}
                    />}
                  </div>
                </div>
              </div>
            </React.Fragment>
            }
            </div>
          </div>

          <div className='pt-5'>
            <h4 className='prog-title col-md-10 mb-3'>Progresso</h4>
            <Link className="edit-prog col-md-2" to={`/dashboard/care-receiver/${patient.id}/edit-progress`}>Modifica progresso</Link>
            {availableLevels && availableLevels.map(level => {
              const open = levelOpen && levelOpen === level.level_id
              return (
                <PCLevelCard
                  showExerciseLink={showExerciseLink}
                  patient={patient}
                  availableExerciseTrees={open ? availableExerciseTrees : null}
                  sessionsExtent={sessionsExtent}
                  open={open}
                  toggleOpen={this.toggleLevelOpen}
                  key={level.level_id}
                  level={level}
                />
              )
            })}
          </div>

        </div>
      </div>
    )
  }
}


export default connect(state => ({
  user: getAuthUser(state),
  patient: getPatient(state),
  sessionsExtent: getSessionsExtent(state),
  stats: getPatientStats(state),
  badges: getPatientBadges(state),
  availableLevels: getPatientAvailableLevels(state),
  availableExerciseTrees: getAvailableExerciseTreesGrouped(state),
}),
{
  loadPatientAvailableLevels,
  loadPatientStats,
  unloadPatientStats,
  loadPatientBadges,
  unloadPatientBadges,
  unloadPatientAvailableLevels,
  loadAvailableExerciseTrees,
  unloadAvailableExerciseTrees,
})(PCDashboard)
