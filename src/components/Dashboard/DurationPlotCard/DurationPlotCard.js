import React from 'react'
import { scaleLinear } from 'd3-scale'
import './DurationPlotCard.scss'

export default function DurationPlotCard({ param, range, domain, minDomain, maxDomain }) {
  const barScale = scaleLinear().domain(domain).range(range)
  return (
    <div className='DurationPlotCard mt-2'>
      <div className='bar-lab'>
        <div className='plot-green' style={{left:`${barScale(minDomain)}%`,right:`${100-barScale(param)}%`}}></div>
      </div>
    </div>
  )
}
