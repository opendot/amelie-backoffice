import React from 'react'
import { scaleLinear } from 'd3-scale'
import './ChartAdvancement.scss'

export default function ChartAdvancement({ param, range, domain, label, minDomain, maxDomain }) {
  const barScale = scaleLinear().domain(domain).range(range)
  return (
    <div className='ChartAdvancement bar-container-lab mt-2'>
      <div className='d-flex justify-content-between text-chart'>
        <div className='label'>{label}</div>
        <div>{param} su {maxDomain}</div>
      </div>
      <div className='bar-lab'>
        <div className='plot-green' style={{left:`${barScale(minDomain)}%`,right:`${100-barScale(param)}%`}}></div>
      </div>
    </div>
  )
}
