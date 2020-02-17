import React from 'react'
import 'dayjs/locale/it'
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Rectangle } from 'recharts'
import {
  DASHBOARD_GREEN,
  DASHBOARD_LIGHT_GREY,
  DASHBOARD_DARK_GREY,
} from '../../../palette'
//import './SessionsBarChart.scss'

const PADDING_TOP = 20
const PADDING_BAR_BOTTOM = 10


export default function SessionsBarChartPotenziamento({ data, patient, ticks, paramY, barBg = false }) {
  return (
    <div className='SessionsBarChartPotenziamento'>
      <ResponsiveContainer width='100%' height={130}>
        <BarChart data={data} barCategoryGap={0} margin={{ top: PADDING_TOP, bottom: 0, left: 0 }}>
          <Bar
            dataKey={paramY}
            background={({ x, y, width, height, className, index, payload }) => {
              // No bg on empty data
              if (+payload[paramY] === 0 || !barBg) {
                return null
              }
              const translateX = x + width / 4
              let paddedHeight = 0
              if (height > 0) {
                paddedHeight = height + PADDING_BAR_BOTTOM
              }

              return <Rectangle
                radius={50}
                key={index}
                x={translateX}
                y={y}
                // opacity={'0.4'}
                fill={DASHBOARD_LIGHT_GREY}
                width={width / 2}
                height={paddedHeight}
                className={className}
              />
            }}
            shape={({ x, y, width, height, className, index }) => {
              const translateX = x + width / 4
              let paddedHeight = 0
              if (height > 0) {
                paddedHeight = height + PADDING_BAR_BOTTOM
              }

              return <Rectangle
                key={index}
                radius={50}
                x={translateX}
                y={y}
                fill={DASHBOARD_GREEN}
                width={width / 2}
                height={paddedHeight}
                className={className}
              />
            }}
          />
          <XAxis
            interval={0}
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={false}
          />
          <YAxis
            tick={{ fill: DASHBOARD_DARK_GREY, fontSize: 13, opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            dateKey={paramY}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
