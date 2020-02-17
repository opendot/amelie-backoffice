import React from 'react'
import MaterialIcon from "material-icons-react"
import classNames from 'classnames'
import dayjs from 'dayjs'
import find from 'lodash/find'
import findLast from 'lodash/findLast'
import last from 'lodash/last'
import findIndex from 'lodash/findIndex'
import keyBy from 'lodash/keyBy'
import chunk from 'lodash/chunk'
import { connect } from 'react-redux'
import { scaleLinear } from 'd3'
import ReactWaves from '@dschoon/react-waves'
import {
  loadSessionEventsForPlayer,
  unloadSessionEventsForPlayer,
  getSessionsEventsForPlayer,
  loadSessionTrackingForPlayer,
  unloadSessionTrackingorPlayer,
  getSessionsTrackingForPlayer,
} from '../../../state/patientDashboard'
import { formatTime } from '../../../utils'
import TrackingCards from './TrackingCards'
import './SessionPlayer.scss'
import get from 'lodash/get'
import memoize from 'memoize-one'

const PLAYER_BODY_H = 250
const TICKS_H = 30

// The width of content for Play / Pause and labels
const LEFT_LABELS_W = 100

const TOP_H = 50
const BOTTOM_H = 50

const EVENT_TOP_H = 80
const EVENT_BOTTOM_H = 80

// width of player bar indicator
const PLAY_BAR_W = 3

const PER_SECONDS_W = 50

const EMPTY_LIST = []

function pageWithCorrect(pageA, pageB) {
  return {
    ...pageA,
    cards: pageA.cards.map((card, i) => ({
      ...card,
      correct: get(find(pageB.cards, {id: card.id} ), 'correct'),
    }))
  }
}

// Events Layers

function EventsLayer({ children }) {
  return (
    <div
      className='w-100'
      style={{ position: 'absolute', top: EVENT_TOP_H, bottom: EVENT_BOTTOM_H }}>
      {children}
    </div>
  )
}

class PointEventsLayer extends React.PureComponent {
  render() {
    const { events, seekTo, scale, className, icon, zIndex } = this.props
    return (
      <EventsLayer>
        {events.map((event, i) => (
          <div
            onClick={() => seekTo(event.time)}
            key={i}
            className={`h-100 position-absolute bg-white border d-flex align-items-center justify-content-center pointer ${className}`}
            style={{
              zIndex: zIndex,
              left: `calc(${scale(event.time)}% - 10px)`,
              width: 20
            }}
          >
            <MaterialIcon icon={icon} size={18} color='black' />
          </div>
        ))}
      </EventsLayer>
    )
  }
}

PointEventsLayer.defaultProps = {
  zIndex: 1,
}

class FeedbackEventsLayer extends React.PureComponent {
  render() {
    const { feedbackEvents, scale, seekTo } = this.props
    return (
      <EventsLayer>
        {feedbackEvents.map((event, i) => (
          <div
            onClick={() => seekTo(event.start)}
            key={i}
            className={classNames('pointer h-100 position-absolute bg-white border text-center feedback-event d-flex align-items-center justify-content-center')}
            style={{
              zIndex: 1,
              left: `${scale(event.start)}%`,
              width: `${scale(event.end - event.start)}%`
            }}
          >
            <MaterialIcon icon={'videocam'} size={20} color='black' />
          </div>
        ))}
      </EventsLayer>
    )
  }
}

class PatientChoiceEventsLayer extends React.PureComponent {
  render() {
    const { patientChoiceEvents, scale, seekTo, communicator } = this.props
    return (
      <EventsLayer>
      {patientChoiceEvents.map((event, i) => (
        <div
          key={i}
          onClick={() => seekTo(event.time)}
          className={classNames('h-100 position-absolute choice-event d-flex align-items-center justify-content-center pointer', {
            'choice-good': event.correct && !communicator,
            'choice-bad': !event.correct && !communicator,
            'choice-neutral border': communicator,
          })}
          style={{
            zIndex: 2,
            left: `calc(${scale(event.time)}% - 20px)`,
            width: 20
          }}
          >
            <MaterialIcon icon={event.correct || communicator ? 'done' : 'clear'} size={18} color={communicator ? 'black' : 'white'} />
          </div>
        ))}
      </EventsLayer>
    )
  }
}

class StepsLayer extends React.PureComponent {

  getLabel = (i) => {
    const { communicator } = this.props
    if(communicator){
      return `Livello ${i+1}`
    }
    return i === 0 ? 'Presentazione' : `Step ${i}`
  }

  render() {
    const { pages, scale } = this.props
    return (
      <div className='w-100 h-100' style={{ position: 'absolute', zIndex: 0 }}>
        {pages.map((page, i) => (
          <div
            key={i}
            className={classNames('h-100 position-absolute border-left border-right', {
              'bg-light': i % 2 === 1,
            })}
            style={{
              left: `${scale(page.start)}%`,
              width: `${scale(page.end - page.start)}%`
            }}
            >
              <div style={{ height: TOP_H }} className='d-flex align-items-center pl-2 step-top-label'>
                {this.getLabel(i)}
              </div>
            </div>
          ))}
      </div>
    )
  }
}


class TimeTicks extends React.PureComponent {
  render() {
    const { scale, tickNumber } = this.props
    return (
      <React.Fragment>
        {scale.ticks(tickNumber).map((tick) => (
          <div
            key={tick}
            style={{
              top: 6,
              left: `calc(${scale(tick)}% - 18px)`
            }}
            className='position-absolute time-tick'
          >
            {formatTime(tick)}
          </div>
        ))}
      </React.Fragment>
    )
  }
}

class Ticks extends React.PureComponent {
  render() {
    const {
      ticksContWidth,
      translateLeft,
      tickNumber,
      scale,
      expandedView,
      seekToNext,
    } = this.props

    return (
      <React.Fragment>
        <div
          style={{
            width: ticksContWidth,
            transform: `translateX(-${translateLeft}px)`,
            left: LEFT_LABELS_W
          }}
          className='h-100 position-absolute time-ticks'>
            <TimeTicks tickNumber={tickNumber} scale={scale} />
        </div>
        {expandedView && <div
          className='position-absolute'
          style={{
            top: `calc(50% - 12px)`,
            bottom: 0,
            width: 70,
            background: 'white',
            userSelect: 'none',
            right: 0,
          }}>
            <span className='pointer' onClick={() => seekToNext(-2)}>
              <MaterialIcon icon='chevron_left' height={20} color='black' /></span>
            <span className='pointer' onClick={() => seekToNext(2)}>
              <MaterialIcon icon='chevron_right' height={20} color='black' /></span>
        </div>}
      </React.Fragment>
    )
  }
}

class PlayPauseControls extends React.PureComponent {
  render() {
    const { playing, togglePlay } = this.props
    return (
      <div className='h-100 d-flex flex-column left-labels-cont border-right position-relative'
        style={{ width: LEFT_LABELS_W, zIndex: 99, background: 'white' }}>
         <div
           className='border-bottom border-bottom-dashed d-flex justify-content-center align-items-center'
           style={{ height: TOP_H + 1 }}>
           STEPS
         </div>
         <div className='flex-1 d-flex justify-content-center align-items-center'>
           EVENTI
         </div>
         <div
           onClick={togglePlay}
           className='play-pause border-top border-top-dashed d-flex justify-content-center align-items-center pointer'
           style={{ height: BOTTOM_H + 1 }}>
           <div className='d-flex justify-content-center align-items-center'>
             AUDIO
             <MaterialIcon icon={playing ? 'pause' : 'play_arrow'} size={20} color='black' />
           </div>
         </div>
      </div>
    )
  }
}

function relativizeEvents(events, startTime) {
  return events.map(event => ({
    ...event,
    time: dayjs(event.timestamp).diff(dayjs(startTime), 'milliseconds') / 1000
  }))
}

function pageWithCardsEvents(page, position, shuffleEvents, transitionToEndEvents) {
  let goodEndEvents = transitionToEndEvents.filter(event => {
    return (
      event.time >= page.start &&
      event.time <= page.end &&
      event.time <= position
    )
  })
  const endEventApplied = last(goodEndEvents)

  if (endEventApplied) {
    return {
      ...page,
      cards: [],
    }
  }

  let goodShuffleEvents = shuffleEvents.filter(event => {
    return (
      event.time >= page.start &&
      event.time <= page.end &&
      event.time <= position
    )
  })
  const shuffleEventApplied = last(goodShuffleEvents)

  if (shuffleEventApplied) {
    return {
      ...page,
      cards: page.cards.map(originalCard => ({
        ...originalCard,
        ...find(shuffleEventApplied.cards, { id: originalCard.id  })
      }))
    }
  }
  return page
}

// -.-'
function noRoundToFixed(n, precision = 1) {
  let [digits, decimals] = n.toString().split('.')

  if (decimals === undefined) {
    decimals = '0'
  }

  decimals = decimals.substr(0, precision)
  return Number(`${digits}.${decimals}`)
}

class SessionPlayer extends React.PureComponent {
  state = {
    playing: false,
    currentPosition: 0,
    duration: 0,
    playerWidth: null,
  }

  componentDidMount() {
    this.setPlayerWidth()
    window.addEventListener('resize', this.setPlayerWidth)
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.expandedView !== prevProps.expandedView ||
      this.state.duration !== prevState.duration
    ) {
      if (this.wavesurfer) {
        this.wavesurfer.drawBuffer()
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setPlayerWidth)
  }

  setPlayerWidth = () => {
    const playerWidth = (
      this.playerContainer.offsetWidth
      - LEFT_LABELS_W
      + 1 // Border
    )
    this.setState({ playerWidth })
  }

  togglePlay = () => this.setState(prevState => ({
    playing: !prevState.playing,
  }))

  onPosChange = (currentPositionSecs, wavesurfer) => {
    const currentPosition = wavesurfer.getCurrentTime()
    const duration = wavesurfer.getDuration()
    const newState = { currentPosition }
    // NOTE: this is needed because the real duration never riched....
    if (noRoundToFixed(currentPosition, 1) >= noRoundToFixed(duration, 1)) {
      newState.playing = false
    }
    this.setState(newState)
  }

  seekTo = (pos) => {
    const progress = this.getScale(this.state.duration)(pos) / 100

    this.wavesurfer.seekTo(progress)
    this.setState({
      currentPosition: pos,
    })
  }

  seekToNext = (delta) => {
    const { currentPosition } = this.state
    const startTime = this.props.sessionDetail.start_time
    const durationSession = this.getDuration(this.props.sessionEvents, startTime)
    const durationTrack = this.state.duration
    const duration = Math.max(durationTrack, durationSession)

    let pos = Math.max(Math.min(currentPosition + delta, duration), 0)
    const progress = this.getScale(durationTrack)(pos) / 100

    this.wavesurfer.seekTo(progress)
    this.setState({
      currentPosition: pos,
    })
  }

  getDuration = memoize((events, startTime) => {
    // return 14.22
    const endEvent = findLast(events, {
      type: "TransitionToEndEvent",
    })
    return dayjs(endEvent.timestamp).diff(dayjs(startTime), 'milliseconds') / 1000
  })

  getEventsWithLocalTime = memoize(relativizeEvents)

  getSessionTrackingWithLocalTime = memoize(relativizeEvents)

  getPages = memoize((events, duration) => {
    let pages = events.filter(event => (
      event.type === "TransitionToPageEvent" ||
      event.type === "TransitionToPresentationPageEvent"
      // event.type === "TransitionToEndEvent"
    ))
    return pages.map((page, i) => {
      return {
        ...page,
        start: page.time,
        end: i === pages.length - 1
         ? duration
         : pages[i + 1].time,
      }
    })
  })

  getFeedbackEvents = memoize(events => {
    let firstFeedbackPageIndex = findIndex(events, event => event.type === 'TransitionToFeedbackPageEvent')
    let feedbackEvents = events.slice(firstFeedbackPageIndex, events.length).filter(event => (
      event.type === 'TransitionToFeedbackPageEvent' ||
      event.type === 'EndExtraPageEvent'
    ))
    feedbackEvents = chunk(feedbackEvents, 2).map(item => ({
      start: item[0].time,
      end: item[1].time,
    }))
    return feedbackEvents
  })

  getPatientChoiceEvents = memoize((events, steps) => {
    const sessionDetailStepsByPage = keyBy(steps, item => item.page_id)
    let patientChoiceEvents = events
      .filter(event => event.type === 'PatientEyeChoiceEvent' || event.type === 'PatientTouchChoiceEvent')
      .map(event => ({
        ...event,
        correct: get(sessionDetailStepsByPage, `[${event.page_id}].correct`),
      }))

    return patientChoiceEvents
  })

  getSoundAlertEvents = memoize(events => {
    return events.filter(event => event.type === 'SoundAlertEvent')
  })

  getPlayerVideoEvents = memoize(events => {
    return events.filter(event => event.type === 'PlayVideoEvent')
  })

  getOperatorChoiceEvents = memoize(events => {
    return events.filter(event => event.type === 'OperatorChoiceEvent')
  })

  getShuffleEvents = memoize(events => {
    return events.filter(event => event.type === 'ShuffleEvent')
  })

  getBackEvents = memoize(events => {
    return events.filter(event => event.type === 'BackEvent')
  })

  getEyeTrackingLockEvents = memoize(events => {
    return events.filter(event => event.type === 'EyetrackerLockEvent')
  })

  getEyeTrackingUnlockEvents = memoize(events => {
    return events.filter(event => event.type === 'EyetrackerUnlockEvent')
  })

  getTransitionToEndEvents = memoize(events => {
    return events.filter(event => event.type === 'TransitionToEndEvent')
  })

  getScale = duration => {
    const scale = scaleLinear().domain([0, duration]).range([0, 100])
    return scale
  }

  getScaleMemo = memoize(this.getScale)

  getItemsInPage = memoize((items, page) => {
    if (!page) {
      return []
    }
    return items.filter(item => {
      return (
        item.time >= page.start &&
        item.time <= page.end
      )
    })
  })

  getCurrentSessionTracking = memoize((sessionsTracking, position) => {
    let currentTrackIndex = null

    for (let i = sessionsTracking.length - 1; i >= 0; i--) {
      if (position >= sessionsTracking[i].time) {
        currentTrackIndex = i
        break
      }
    }

    if (currentTrackIndex === null) {
      return null
    }

    return sessionsTracking[currentTrackIndex]

  })

  getCurrentPage = memoize((position, pages, exercise, shuffleEvents, transitionToEndEvents) => {
    let currentIndex = null
    for (let i = 0; i < pages.length; i++) {
      if (position >= pages[i].start && position <= pages[i].end) {
        currentIndex = i
        break
      }
    }

    if (currentIndex === null) {
      return null
    }

    let page = pages[currentIndex]
    page = pageWithCardsEvents(page, position, shuffleEvents, transitionToEndEvents)

    // No exercise no correct ecc
    if (!exercise) {
      return page
    }

    // Merge correct info from exercise
    let pageExercise
    if (currentIndex === 0) {
      pageExercise = exercise.exercise_tree.presentation_page
    } else {
      pageExercise = exercise.exercise_tree.pages[currentIndex - 1]
    }

    return pageWithCorrect(page, pageExercise)
  })

  render() {
    const { audioUrl, session, sessionEvents, sessionTracking, sessionDetail, exercise, expandedView, communicator } = this.props
    const { playing, currentPosition, playerWidth } = this.state

    const startTime = sessionDetail.start_time
    const steps = sessionDetail.steps

    const durationTrack = this.state.duration
    const durationSession = this.getDuration(sessionEvents, startTime)
    const duration = Math.max(durationTrack, durationSession)

    // Add relative time
    const eventsWithLocalTime = this.getEventsWithLocalTime(sessionEvents, startTime)

    // Events and pages
    const pages = this.getPages(eventsWithLocalTime, durationSession)
    const feedbackEvents = this.getFeedbackEvents(eventsWithLocalTime)
    const patientChoiceEvents = this.getPatientChoiceEvents(eventsWithLocalTime, steps)
    const soundAlertEvents = this.getSoundAlertEvents(eventsWithLocalTime)
    const playerVideoEvents = this.getPlayerVideoEvents(eventsWithLocalTime)
    const operatorChoiceEvents = this.getOperatorChoiceEvents(eventsWithLocalTime)
    const shuffleEvents = this.getShuffleEvents(eventsWithLocalTime)
    const backEvents = this.getBackEvents(eventsWithLocalTime)
    const trackingLockEvents = this.getEyeTrackingLockEvents(eventsWithLocalTime)
    const trackingUnlockEvents = this.getEyeTrackingUnlockEvents(eventsWithLocalTime)
    const transitionToEndEvents = this.getTransitionToEndEvents(eventsWithLocalTime)

    // Meoized scale
    const scale = this.getScaleMemo(duration)

    // NOTE: Reduce the precision of current position to avoid
    // re-invoke memoized stuff on events filters too often
    // and improve performance keeping the user experience good
    const nearCurrentPosition = +currentPosition.toFixed(1)

    // Current page
    const currentPage = this.getCurrentPage(
      nearCurrentPosition,
      pages,
      exercise,
      shuffleEvents,
      transitionToEndEvents
    )

    // Tracking with local time
    const sessionTrackingWithLocalTime = this.getSessionTrackingWithLocalTime(sessionTracking, startTime)
    // Tracking in current page
    // const sessionsTrackingInPage = this.getItemsInPage(sessionTrackingWithLocalTime, currentPage)
    // Current (the last in current step/page)
    const currentSessionTracking = this.getCurrentSessionTracking(sessionTrackingWithLocalTime, nearCurrentPosition)

    let fullPlayerWidth = 0
    let translateLeft = 0
    let ticksContWidth = 0

    if (playerWidth) {
      if (expandedView) {
        const maxFullPlayerWidth = duration * PER_SECONDS_W
        const minFullPlayerWidth = playerWidth * 2
        fullPlayerWidth = Math.max(minFullPlayerWidth, maxFullPlayerWidth)
        const playerLeft = (scale(currentPosition) / 100) * fullPlayerWidth
        translateLeft = Math.max(playerLeft - playerWidth, 0)
        if (translateLeft !== 0) {
          translateLeft = (Math.floor((translateLeft / playerWidth) + 1)) * playerWidth
        }
        ticksContWidth = fullPlayerWidth
      } else {
        fullPlayerWidth = playerWidth
        ticksContWidth = playerWidth - 18
      }
    }

    let cards = EMPTY_LIST
    if (currentPage && currentPage.cards) {
      cards = currentPage.cards
    }

    const tickNumber = Math.min(10, parseInt(duration))

    let wavesPlayerWidth = 100
    if (durationTrack !== 0 && durationTrack < durationSession) {
      wavesPlayerWidth = scale(durationTrack)
    }

    return (
      <div className='SessionPlayer'>
        <div className='w-100 row no-gutters' style={{ height: PLAYER_BODY_H }}>
          <div className='col-md-3 bg-info h-100'>
            <TrackingCards
              resolutionX={session.screen_resolution_x || undefined}
              resolutionY={session.screen_resolution_y || undefined}
              cards={cards}
              sessionTracking={currentSessionTracking}
            />
          </div>
          <div
            ref={r => this.playerContainer = r}
            className='col-md-9 h-100 position-relative overflow-hidden border-right'>

            <PlayPauseControls
              playing={playing}
              togglePlay={this.togglePlay}
            />

            <div className='h-100' style={{
              transform: `translateX(-${translateLeft}px)`,
              width: fullPlayerWidth,
              position: 'absolute',
              top: 0,
              left: LEFT_LABELS_W
            }}>
              {/* Layer sfondo steps  */}
              <StepsLayer
                communicator={this.props.communicator}
                pages={pages}
                scale={scale}
              />
              {/* feedback events  */}
              <FeedbackEventsLayer
                feedbackEvents={feedbackEvents}
                scale={scale}
                seekTo={this.seekTo}
              />
              {/* patient choice: alignment: end of rect = event time  */}
              <PatientChoiceEventsLayer
                communicator={communicator}
                patientChoiceEvents={patientChoiceEvents}
                scale={scale}
                seekTo={this.seekTo}
              />

              {/* sound alerts. alignment: centered in event.time   */}
              <PointEventsLayer
                className='point-event sound-event'
                icon='notifications'
                zIndex={1}
                events={soundAlertEvents}
                seekTo={this.seekTo}
                scale={scale}
              />
              <PointEventsLayer
                className='point-event player-video-event'
                icon='play_circle_outline'
                zIndex={2}
                events={playerVideoEvents}
                seekTo={this.seekTo}
                scale={scale}
              />
              <PointEventsLayer
                className='point-event operator-choice-event'
                icon='how_to_reg'
                zIndex={3}
                events={operatorChoiceEvents}
                seekTo={this.seekTo}
                scale={scale}
              />
              <PointEventsLayer
                className='point-event shuffle-event'
                icon='shuffle'
                zIndex={4}
                events={shuffleEvents}
                seekTo={this.seekTo}
                scale={scale}
              />
              <PointEventsLayer
                className='point-event back-event'
                icon='settings_backup_restore'
                zIndex={4}
                events={backEvents}
                seekTo={this.seekTo}
                scale={scale}
              />
              <PointEventsLayer
                className='point-event tracking-lock-event'
                icon='lock'
                zIndex={5}
                events={trackingLockEvents}
                seekTo={this.seekTo}
                scale={scale}
              />
              <PointEventsLayer
                className='point-event tracking-unlock-event'
                icon='lock_open'
                zIndex={6}
                events={trackingUnlockEvents}
                seekTo={this.seekTo}
                scale={scale}
              />
              
              {/* Lines dashed */}
              <div
                className='position-absolute w-100 border-top border-bottom border-y-dashed'
                style={{
                  top: TOP_H,
                  bottom: BOTTOM_H,
                }}
              />
              {/* Current pos indicator */}
              <div
                className='position-absolute position-bar'
                style={{
                  left: currentPosition === 0 ? 0 : `calc(${scale(currentPosition)}% - ${PLAY_BAR_W / 2}px)`,
                  // width: playing ? PLAY_BAR_W : 0,
                  width: PLAY_BAR_W,
                  top: 0,
                  bottom: 0
                }}
              />
              {/* Player audio */}
              <div style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: BOTTOM_H,
                zIndex: 9,
                width: `${wavesPlayerWidth}%`
              }}>
                  <ReactWaves
                    audioFile={audioUrl}
                    className={'audio-player-session'}
                    options={{
                      fillParent: true,
                      barWidth: 3,
                      // barHeight: 2,
                      cursorWidth: 0,
                      height: 50,
                      hideScrollbar: true,
                      progressColor: 'black',
                      responsive: true,
                      waveColor: '#D1D6DA',
                  }}
                  volume={1}
                  zoom={1}
                  playing={playing}
                  pos={currentPosition}
                  onReady={({ wavesurfer }) => {
                    this.wavesurfer = wavesurfer
                    this.setState({ duration: this.wavesurfer.getDuration() })

                  }}
                  onPosChange={this.onPosChange}
                />
              </div>
            </div>
          </div>
        </div>
        {/* The Bottom of player */}
        <div className='w-100 row no-gutters border border-top-0 rounded-bottom' style={{ height: TICKS_H }}>
          <div className='col-md-3 h-100 border-right' />
          <div className='col-md-9 h-100 d-flex overflow-hidden border-top'>
            <div style={{ width: LEFT_LABELS_W  }} />
            <Ticks
              ticksContWidth={ticksContWidth}
              translateLeft={translateLeft}
              tickNumber={tickNumber}
              scale={scale}
              expandedView={expandedView}
              seekToNext={this.seekToNext}
            />
          </div>
        </div>
      </div>
    )
  }
}

function proxyUrl(url) {
  if (typeof url !== 'string') {
    return url
  }
  return url.replace(/http(s)?(:\/\/)[^/]*/, '')
}

class SessionPlayerContainer extends React.Component {
  componentDidMount() {
    const { session, patient } = this.props
    this.props.loadSessionEventsForPlayer(patient.id, session.id)
    this.props.loadSessionTrackingForPlayer(patient.id, session.id)
  }

  componentDidUpdate(prevProps) {
    if (this.props.session !== prevProps.session && this.props.session) {
      const { session, patient } = this.props
      this.props.loadSessionEventsForPlayer(patient.id, session.id)
      this.props.loadSessionTrackingForPlayer(patient.id, session.id)
    }
  }

  componentWillUnmount() {
    const { session } = this.props
    if (session) {
      this.props.unloadSessionEventsForPlayer(session.id)
      this.props.unloadSessionTrackingorPlayer(session.id)
    }
  }

  render() {
    const { session, sessionsEvents, sessionsTracking, sessionDetail, exercise, expandedView, communicator } = this.props

    // Waiting 2 sessions events
    if (!sessionsEvents[session.id]) {
      return null
    }
    // Waiting 2 sessions tracking
    if (!sessionsTracking[session.id]) {
      return null
    }

    const sessionEvents = sessionsEvents[session.id]
    const sessionTracking = sessionsTracking[session.id]

    // NOTE
    // The S3 url of audio is currently without CORS so...
    // here we go again, replace the domain and use CRA Proxy ...
    // look at src/setupProxy.js
    let audioUrl
    audioUrl = proxyUrl(get(session, 'audio_file.audio_file_url'))
    if (!audioUrl && sessionDetail) {
      audioUrl = proxyUrl(get(sessionDetail, 'audio_file.audio_file.url'))
    }

    return (
      <SessionPlayer
        communicator={communicator}
        expandedView={expandedView}
        audioUrl={audioUrl}
        session={session}
        exercise={exercise}
        sessionDetail={sessionDetail}
        sessionEvents={sessionEvents}
        sessionTracking={sessionTracking}
      />
    )
  }
}

export default connect(state => ({
  sessionsEvents: getSessionsEventsForPlayer(state),
  sessionsTracking: getSessionsTrackingForPlayer(state),
}), {
  loadSessionEventsForPlayer,
  unloadSessionEventsForPlayer,
  loadSessionTrackingForPlayer,
  unloadSessionTrackingorPlayer,
})(SessionPlayerContainer)
