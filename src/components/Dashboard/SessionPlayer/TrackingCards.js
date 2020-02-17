import React from 'react'
import {
  DASHBOARD_GREEN,
  DASHBOARD_RED
} from '../../../palette'

function getCardColor(card) {
  if (card.correct === null || card.correct === undefined) {
    return 'white'
  }
  if (card.correct) {
    return DASHBOARD_GREEN
  } else {
    return DASHBOARD_RED
  }
}

export default class TrackingCards extends React.PureComponent {
  render() {
    const { sessionTracking, cards, resolutionX, resolutionY } = this.props

    return (
      <svg className="h-100 w-100 bg-dark" viewBox={`0 0 ${resolutionX} ${resolutionY}`}>
        {cards.map(card => (
          <g key={card.id}>
            <rect
              fill='white'
              stroke={getCardColor(card)}
              strokeWidth={20}
              height={600 * card.scale + 2}
              width={500 * card.scale + 40}
              x={card.x_pos * resolutionX - 20}
              y={card.y_pos * resolutionY + 1}
              >
              </rect>
            {card.content.type === 'Text' && <text
              style={{ fontSize: 55 }}
              x={card.x_pos * resolutionX - 20 + (500 * card.scale + 2) / 2}
              y={card.y_pos * resolutionY + 1 + (600 * card.scale + 20) / 2}
              stroke='black' textAnchor='middle' alignment='baseline' >{card.label}</text>}
            {card.content.type === 'GenericImage' && (
              <image
                // preserveAspectRatio='none'
                x={card.x_pos * resolutionX}
                y={card.y_pos * resolutionY}
                height={600 * card.scale}
                width={500 * card.scale}
                xlinkHref={card.content.content.thumb.url}
              />)}
          </g>
        ))}
        {sessionTracking && (
          <g>
            <circle
              fillOpacity='0.6'
              // stroke='white'
              fill='black'
              cx={sessionTracking.x_position * resolutionX}
              cy={sessionTracking.y_position * resolutionY}
              r={resolutionX / 20}
            />
            <circle
              fillOpacity='0.6'
              fill='transparent'
              stroke='white'
              strokeWidth={3}
              cx={sessionTracking.x_position * resolutionX}
              cy={sessionTracking.y_position * resolutionY}
              r={resolutionX / 25}
            />
            {/* CROSS  */}
            <line
              stroke='white'
              strokeWidth={3}
              x1={sessionTracking.x_position * resolutionX}
              y1={sessionTracking.y_position * resolutionY - 20}
              x2={sessionTracking.x_position * resolutionX}
              y2={sessionTracking.y_position * resolutionY + 20}
            />
            <line
              stroke='white'
              strokeWidth={3}
              x1={sessionTracking.x_position * resolutionX - 20}
              y1={sessionTracking.y_position * resolutionY}
              x2={sessionTracking.x_position * resolutionX + 20}
              y2={sessionTracking.y_position * resolutionY}
            />
          </g>
        )}
      </svg>
    )
  }
}

TrackingCards.defaultProps = {
  resolutionX: 1280,
  resolutionY: 720,
}
