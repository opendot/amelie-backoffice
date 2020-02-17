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
import PCLevelCardEditProgress from '../../components/Dashboard/PCLevelCardEditProgress'
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
    this.props.loadPatientAvailableLevels(patient.id)
   // this.props.loadAvailableExerciseTrees(patient.id)
    // add
  }

  
  componentWillUnmount() {
    this.props.unloadPatientAvailableLevels()
    this.props.unloadAvailableExerciseTrees()
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


  render() {
    const { patient, availableLevels, availableExerciseTrees, sessionsExtent, user } = this.props
    const { levelOpen } = this.state
    
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
            <li className="breadcrumb-item">Edit Potenziamento Cognitivo</li>
          </ol>
        </nav>
        <div className='container-fluid'>
          

          <div className='pt-5'>
            <h4 className='mb-3'>Modifica Progresso</h4>

            {availableLevels && availableLevels.map(level => {
              const open = levelOpen && levelOpen === level.level_id
              return (
                <PCLevelCardEditProgress
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
  availableLevels: getPatientAvailableLevels(state),
  availableExerciseTrees: getAvailableExerciseTreesGrouped(state),
}),
{
  loadPatientAvailableLevels,
  unloadPatientAvailableLevels,
  loadAvailableExerciseTrees,
  unloadAvailableExerciseTrees,
})(PCDashboard)
