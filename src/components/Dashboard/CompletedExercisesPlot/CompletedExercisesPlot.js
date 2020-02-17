import React from 'react'
//import { scaleLinear } from 'd3-scale'
import './CompletedExercisesPlot.scss'
import range from 'lodash/range'

export default function CompletedExercisesPlot({ exercises }) {
  const total = exercises.total
  const completed = exercises.completed
  const onGoing = exercises.ongoing
  const toComplete = total - completed - onGoing
  return (
    <div className='CompletedExercisesPlot d-flex flex-row flex-wrap mt-2'>
      {completed > 0 &&
        range(completed).map((i) => (
          <div key={i} className='exercise complete'></div>
        ))
      }
      {onGoing > 0 &&
        range(onGoing).map((i) => (
          <div key={i} className='exercise on-going'></div>
        ))
      }
      {toComplete > 0 &&
        range(toComplete).map((i) => (
          <div key={i} className='exercise to-complete'></div>
        ))
      }
    </div>
  )
}
