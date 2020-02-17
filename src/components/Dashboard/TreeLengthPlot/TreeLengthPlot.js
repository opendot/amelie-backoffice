import React from 'react'
//import { scaleLinear } from 'd3-scale'
import './TreeLengthPlot.scss'
import range from 'lodash/range'

export default function TreeLengthPlot({ numberOfLevels }) {
  return (
    <div className='TreeLengthPlot d-flex flex-row flex-wrap mt-2'>
      {numberOfLevels > 0 &&
        range(numberOfLevels).map((i) => (
          <div key={i} className='level complete'></div>
        ))
      }
    </div>
  )
}
