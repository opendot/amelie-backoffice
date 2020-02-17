import React from 'react'
import { LineChart, ResponsiveContainer, XAxis, YAxis, Line, ReferenceLine } from 'recharts'
import {
  DASHBOARD_GREEN,
  DASHBOARD_DARK_GREY,
} from '../../../palette'
//import './SessionsBarChart.scss'

const PADDING_TOP = 20


export default function AverageSpeedOfSelection({ data, patient, media }) {
  return (
    <div className='SessionsBarChartPotenziamento'>
      <ResponsiveContainer width='100%' height={130}>
        <LineChart  data={data}
          margin={{ top: PADDING_TOP, bottom: 0, left: 0 }}>

          <XAxis
            interval={0}
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={false}
          />
          <YAxis
            dataKey="seconds"
            tick={{ fill: DASHBOARD_DARK_GREY, fontSize: 13, opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
          />
          <Line dot={false} dataKey="seconds" stroke={DASHBOARD_GREEN} />
          <ReferenceLine y={media} stroke="#212B36" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
