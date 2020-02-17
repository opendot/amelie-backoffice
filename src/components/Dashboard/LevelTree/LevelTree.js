import React from 'react'
import MaterialIcon from "material-icons-react"
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { scaleLinear } from 'd3'
import classNames from 'classnames'
import memoize from 'memoize-one'
import TooltipTrigger from 'react-popper-tooltip'
import {
  getSessionsForTooltip,
  loadSessionForTooltip,
  unloadAllSessionsForTooltip,
} from '../../../state/patientDashboard'
import 'react-popper-tooltip/dist/styles.css'
import './LevelTree.scss'

class Tooltip extends React.PureComponent {
  componentDidMount() {
    this.loadCurrentSession()
  }

  componentDidUptate(prevProps) {
    if (prevProps.session !== this.props.session) {
      this.loadCurrentSession()
    }
  }

  loadCurrentSession = () => {
    const {
      session, patient, sesssionsTooltip,
      loadSessionForTooltip
    } = this.props

    if (!sesssionsTooltip[session.id]) {
      loadSessionForTooltip(patient.id, session.id)
    }
  }

  render() {
    const {
      tooltipRef,
      getTooltipProps,
      session,
      sesssionsTooltip,
    } = this.props

    let steps = []
    if (sesssionsTooltip[session.id]) {
      steps = sesssionsTooltip[session.id].steps
    }

    const d = dayjs(session.start_time)

    return (
      <div
        {...getTooltipProps({
          ref: tooltipRef,
          className: 'tooltip-container level-tree-tooltip-container'
        })}
      >
        <div
          className={classNames('tooltip-bar', {
            'bar-success': session.success,
            'bar-insuccess': !session.success,
          })}
        />
        <div className='tooltip-content'>
          <div className='session-time'>
            Sessione del {d && d.format('DD/MM/YYYY')}
          </div>
          <div className='session-step d-flex align-items-center mt-1'>
            <div>STEP</div>
            <div className='d-flex ml-1'>
              {steps.map((step, i) => (
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
          <div className='session-speed'>
            VELOCITÀ MEDIA{' '}
            <span className='text-dashboard-dark-grey'>
              {(session.average_selection_speed_ms / 1000).toFixed(0)}{' sec'}</span>
          </div>
        </div>
      </div>
    )
  }
}

Tooltip = connect(state => ({
  sesssionsTooltip: getSessionsForTooltip(state),
}), {
  loadSessionForTooltip,
})(Tooltip)


const POINT_WIDTH = 4
const POINT_MARGIN = 1
const BASE_POINT_LEFT = 20
const ROW_H = 27
const POINT_BOTTOM = 2
const POINT_TOP = 2
const POINT_H = ROW_H - POINT_TOP - POINT_BOTTOM

function SessionRow({ sessions, scale, offset = 0, patient, className = '' }) {
  return (
    <div className={`${className}`}>
      {sessions.map((session, i) => {
        const index = i + offset
        return (
          <TooltipTrigger
            key={session.id}
            trigger='hover'
            placement='top-start'
            tooltip={props => <Tooltip {...props} patient={patient} session={session} />}
          >
           {({ getTriggerProps, triggerRef }) => (
              <div
                {...getTriggerProps({
                  ref: triggerRef,
                  session,
                  className: classNames('session-point', {
                    'point-success': session.success,
                    'point-insuccess': !session.success,
                  }),
                  style: {
                    height: scale ? scale(session.average_selection_speed_ms) : POINT_H,
                    bottom: POINT_BOTTOM,
                    width: POINT_WIDTH,
                    left: index * POINT_WIDTH + BASE_POINT_LEFT + POINT_MARGIN * index,
                  }
                })}
                key={session.id}
              />
           )}
          </TooltipTrigger>
        )
      })}
    </div>
  )
}

function SessionTree({ tree, scale, patient }) {
  return tree.map(({ target, tree: targetTree }, j) => (
    <div key={target.target_id} className={classNames('session-target', {
      'border-bottom border-b-strong': !(
        j === tree.length - 1
      )
    })}>
      {targetTree.map((exercise, i) => (
        <SessionRow
          patient={patient}
          scale={scale}
          offset={j}
          className={classNames('session-row', {
            'odd': (i + j) % 2 !== 0,
            'even': (i + j) % 2 === 0,
          })}
          sessions={exercise.cognitive_sessions}
          key={exercise.exercise_tree.id}
        />
      ))}
    </div>
  ))
}

class LevelTree extends React.Component {

  state = {
    showSpeed: false,
  }

  componentWillUnmount() {
    this.props.unloadAllSessionsForTooltip()
  }


  getSessionsScale = memoize(ext => {
    return scaleLinear().domain([0, ext[1]]).range([0, POINT_H])
  })

  render() {
    const { excerciseTree, sessionsExtent, patient, showExerciseLink } = this.props
    const sessionsScale = this.getSessionsScale(sessionsExtent)

    return (
      <div className='LevelTree border rounded-bottom mb-2 container-fluid'>

        <div className='row level-tree-header pl-3 pt-3 pb-2'>
          <div className='col-md-4'>
            <div className='row'>
              <div className='col-md-3'>
                TEMA
              </div>
              <div className='col-md-9'>
                <div className='row'>
                  <div className='col-md-5'>TARGET</div>
                  <div className='col-md-7'>ESERCIZIO</div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-8 d-flex justify-content-between'>
            <div>SESSIONI</div>
            <div className='form-check show-speed-check'>
              <input
                id='show-speed'
                type='radio'
                checked={this.state.showSpeed}
                onChange={() => {}}
                onClick={() => {
                  this.setState({
                    showSpeed: !this.state.showSpeed,
                  })
                }}
              />
              <label htmlFor='show-speed' className='ml-2'>
                Visualizza velocità di selezione
              </label>
            </div>
          </div>
        </div>

        {excerciseTree.map(({ box, tree: boxTree }, k) => (
          <div className={classNames('level-row row pl-3', {
            'border-top border-t-strong': k > 0,
          })} key={box.box_id}>
            <div className={classNames('col-md-4 border-right', {
              'pt-2': k > 0,
            })}>
              <div className='row'>
                <div className='col-md-3'>
                  <h6>{box.box_name}</h6>
                </div>
                <div className='col-md-9'>
                  {boxTree.map(({ target, tree }, j) => (
                    <div className='target-tree' key={target.target_id}>
                      <div className={classNames('row', {
                        'border-bottom border-b-strong': !(
                          j === boxTree.length - 1
                        ),
                      })}>
                        <div className='col-md-5'>
                          <div className='target-label'>{target.target_name}</div>
                        </div>
                        <div className='col-md-7'>
                          {tree.map(exercise => (
                            <div
                              className={classNames('exercise-label', {
                                'completed': exercise.completed,
                                'in-progress': exercise.in_progress && !exercise.completed,
                              })}
                              key={exercise.exercise_tree.id}>
                              <div className='exercise-completation' />
                              <div className='exercise-link'>
                                {((exercise.completed || exercise.in_progress) && showExerciseLink) ? (
                                  <Link to={`/dashboard/care-receiver/${patient.id}/exercise/${exercise.exercise_tree.id}`}>
                                    {exercise.exercise_tree.name}</Link>
                                ) : (
                                  exercise.exercise_tree.name
                                )}

                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={classNames('col-md-8 pl-0 pr-0', {
              'pt-2': k > 0,
            })}>
              <SessionTree
                patient={patient}
                tree={boxTree}
                scale={this.state.showSpeed ? sessionsScale : null}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }
}

LevelTree.defaultProps = {
  showExerciseLink: false,
}

export default connect(undefined, {
  unloadAllSessionsForTooltip,
})(LevelTree)
