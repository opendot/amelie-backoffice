import React from 'react'
import { scaleLinear } from 'd3-scale'
import './AdvancementPlotCard.scss'

export default function AdvancementPlotCard({ param, range, domain, minDomain, maxDomain }) {
  const barScale = scaleLinear().domain(domain).range(range)
  return (
    <div className='AdvancementPlotCard mt-2'>
      <div className='bar-lab'>
        <div className='plot-green' style={{left:`${barScale(minDomain)}%`,right:`${100-barScale(param)}%`}}></div>
      </div>
    </div>
  )
}
