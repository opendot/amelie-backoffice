import React from 'react'

export default function LastBadge({ lastBadge, patientName }) {

  return (
    <div>
      {lastBadge.achievement === 'target' && <React.Fragment>
        {patientName} ha completato il target "{lastBadge.target_name}" del livello {lastBadge.level_name}.
      </React.Fragment>}
      {lastBadge.achievement === 'level' && <React.Fragment>
        {patientName} ha completato il livello {lastBadge.level_name}.
      </React.Fragment>}
      {lastBadge.achievement === 'box' && <React.Fragment>
        {patientName} ha completato il box "{lastBadge.box_name}" del livello {lastBadge.level_name}.
      </React.Fragment>}
    </div>
  )
}
