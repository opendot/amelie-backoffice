import React from 'react'
import dayjs from 'dayjs'
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, CartesianGrid, Rectangle, Dot, Tooltip } from 'recharts'
import {
  DASHBOARD_GREEN,
  DASHBOARD_LIGHT_GREY,
  DASHBOARD_DARK_GREY,
} from '../../../palette'
import './SessionsBarChart.scss'

const PADDING_TOP = 20
const PADDING_BOTTOM = 130
const PADDING_BAR_BOTTOM = 10

function DayTick({ x, y, stroke, payload, sessions }) {
  const d = dayjs(payload.value, 'DD-MM-YYYY')
  const dayNumber = d.format('DD')
  const weekDay = d.format('dd')
  const badges = sessions[payload.index].badges
  const today = dayjs()
  const currentDay = today.format('DD-MM-YYYY') === payload.value

  const R = 8
  return (
     <g transform={`translate(${x},${y})`}>
       {currentDay && <circle cy={45} r={11} style={{fill:'red'}}/>}
       <text
         fill={DASHBOARD_DARK_GREY} fontSize={13} opacity={0.5}
         x={0} y={0} dy={30} textAnchor="middle">{weekDay.charAt(0).toUpperCase()}</text>
       <text
         fill={currentDay ? '#fff' : DASHBOARD_DARK_GREY} fontSize={13} opacity={currentDay ? 1 : 0.5}
         x={0} y={0} dy={50} textAnchor="middle">{dayNumber}</text>
        {badges && <Dot cx={0} r={R} cy={50 + R + 12} fill={DASHBOARD_GREEN} />}
    </g>
  )
}

function CustomTooltip({active, payload, label, patient}) {
  if (active && payload) {
    const R = 8
    const d = dayjs(label, 'DD-MM-YYYY')
    const dateComplete = d.format('dddd DD MMMM')
    const num_sessions = payload[0].value
    const badges = payload[0].payload.badges
    return (
      <div className="custom-tooltip shadow">
        <div className="date">{`${dateComplete}`}</div>
        <div className="sessions-desc mt-2">
          {patient.name} ha svolto {num_sessions} session{num_sessions === 1 ? 'e' : 'i'}.
        </div>
        {badges &&
          <div>
            <svg height={20} width={20}>
              <circle cx={R} cy={R} r={R} fill={DASHBOARD_GREEN} />
            </svg>
            <span className='badges-tooltip'>{patient.name} ha superato il livello "Tavolo"</span>
          </div>
        }
      </div>
    )
  }
  return null;
}

export default function SessionsBarChart({ sessions, patient }) {
  return (
    <div className='SessionsBarChart'>
      <ResponsiveContainer width='100%' height={400}>
        <BarChart data={sessions} barCategoryGap={0} margin={{ top: PADDING_TOP, bottom: PADDING_BOTTOM / 2, left: 0 }}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} />
          <Bar
            dataKey="sessions_count"
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
            background={({ x, y, width, height, className, index }) => {
              if (index % 2 !== 0) {
                return null
              }

              return <Rectangle
                key={index}
                x={x}
                y={y - PADDING_TOP}
                opacity={'0.4'}
                fill={DASHBOARD_LIGHT_GREY}
                width={width}
                height={height + PADDING_TOP + PADDING_BOTTOM}
                className={className}
              />
            }}
          />
          <Tooltip
            cursor={false}
            patient={patient}
            // offset={-100}
            content={<CustomTooltip />}
          />
          <XAxis
            interval={0}
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={<DayTick sessions={sessions} />}
          />
          <YAxis
            label={{
              value: 'SESSIONI',
              angle: -90,
              position: 'insideBottomLeft',
              offset: 20,
              fill: DASHBOARD_DARK_GREY,
              fontSize: 12,
              opacity: 0.5
            }}
            tick={{ fill: DASHBOARD_DARK_GREY, fontSize: 13, opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            dateKey="sessions_count"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
