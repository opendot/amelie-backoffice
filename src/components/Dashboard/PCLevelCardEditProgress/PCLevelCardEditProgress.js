import React from 'react'
import classNames from 'classnames'
import MaterialIcon from "material-icons-react"
import AdvancementPlotCard from '../AdvancementPlotCard'
import CompletedExercisesPlot from '../CompletedExercisesPlot'
import LevelTreeEditProgress from '../LevelTreeEditProgress'
import './PcLevelCardEditProgress.scss'

class PCLevelCardEditProgress extends React.PureComponent {
  render() {
    const { patient, open, level, toggleOpen, availableExerciseTrees, sessionsExtent } = this.props
    const correctAnswersPercentage = parseInt(level.correct_answers * 100, 10)
    const completedExercisePercentage = level.exercise_trees.total > 0
      ?
      ((level.exercise_trees.completed / level.exercise_trees.total)*100).toFixed(0)
      : 0
    return (
      <React.Fragment>
        <div className={classNames('PCLevelCard border p-3', {
          'rounded mb-2': !open,
          'rounded-top': open,
        })}>
          <div className='row'>
            <div className='col-md-3 d-flex'>
              <button
                type="button"
                onClick={() => toggleOpen(level)}
                className="btn btn-white border rounded-circle button-circle-lg mr-2 d-flex">
                  <MaterialIcon icon={open ? 'remove' : 'add'} />
              </button>
              <div className='ml-3'>
                <div className='level-title'>LIVELLO</div>
                <div className='level-name'><b>{level.level_name}</b></div>
              </div>
            </div>
            <div className='col-md-3'>
              <div className='level-title'>ESERCIZI COMPLETATI</div>
              <div className='level-value'>{completedExercisePercentage}{' %'}</div>
              <div>
                {level.exercise_trees &&
                <CompletedExercisesPlot
                  exercises={level.exercise_trees}
                />
                }
              </div>
            </div>
            <div className='col-md-3'>
              <div className='level-title'>RISPOSTE CORRETTE</div>
              {correctAnswersPercentage > 0 ?
              <div>
                <div className='level-value'>{correctAnswersPercentage}{' %'}</div>
                <AdvancementPlotCard
                  domain={[0,100]}
                  minDomain='0'
                  maxDomain={100}
                  range={[0,100]}
                  param={correctAnswersPercentage}
                />
              </div>
              :
              <div className='level-value'>Nessun dato</div>
              }
            </div>
            <div className='col-md-3'>
              <div className='level-title'>VELOCITÀ MEDIA DI SELEZIONE</div>
              <div className='level-name'>
                {level.average_selection_speed_ms > 0 ?
                  (level.average_selection_speed_ms / 1000).toFixed(1)+' sec'  :
                  <div>Nessun Dato</div>
                }
              </div>
            </div>
          </div>
        </div>
        {open && !availableExerciseTrees && (
          <div className='p-2 mb-2 border rounded-bottom'>
            Loading sessions...
          </div>
        )}
        {availableExerciseTrees && <LevelTreeEditProgress
          showExerciseLink={this.props.showExerciseLink}
          patient={patient}
          excerciseTree={availableExerciseTrees}
          sessionsExtent={sessionsExtent}
        />}
      </React.Fragment>
    )
  }
}

export default PCLevelCardEditProgress
