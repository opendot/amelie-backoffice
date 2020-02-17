import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import classNames from 'classnames'
import MaterialIcon from "material-icons-react";
import { getPatient } from '../../state/patients'
import SessionCard from '../../components/Dashboard/SessionCard'
import {
  getExerciseTree,
  loadExerciseTree,
  unloadExerciseTree
} from '../../state/patientDashboard'
import './ExerciseDetail.scss'

class ExerciseDetail extends React.Component {

  state = {
    expandedView: false
  }

  componentDidMount() {
    const { patient } = this.props
    this.props.loadExerciseTree(patient.id, this.props.match.params.exerciseId)
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.exerciseId !== prevProps.match.params.exerciseId) {
      const { patient } = this.props
      this.props.unloadExerciseTree()
      this.props.loadExerciseTree(patient.id, this.props.match.params.exerciseId)
    }
  }

  componentWillUnmount() {
    this.props.unloadExerciseTree()
  }

  render() {
    const { exercise, patient } = this.props

    if (exercise === null) {
      return null
    }

    return (
      <div className='ExerciseDetail p-4'>
        <div className='container-fluid'>
          <div className='d-flex align-items-center'>
            <Link
              style={{ height: 20 }}
              to={`/dashboard/care-receiver/${patient.id}/potenziamento-cognitivo`}>
              <MaterialIcon icon="arrow_back" color="black" />
            </Link>
            <div className={classNames('title-bar ml-2', {
              'completed': exercise.completed,
              'in-progress': exercise.in_progress && !exercise.completed,
            })}></div>
            <div className='title-name'>
              {exercise && exercise.exercise_tree.name}
            </div>
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

          {exercise.cognitive_sessions.map(session => (
            <SessionCard
              expandedView={this.state.expandedView}
              key={session.id}
              exercise={exercise}
              patient={patient}
              session={session}
            />
          ))}

        </div>
      </div>
    )
  }
}

export default connect(state => ({
  patient: getPatient(state),
  exercise: getExerciseTree(state),
}), {
  loadExerciseTree,
  unloadExerciseTree,
})(ExerciseDetail)
