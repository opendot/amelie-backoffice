import React from 'react'
import {
  Carousel,
  CarouselItem,
  CarouselIndicators,
} from 'reactstrap';
import dayjs from 'dayjs'
import LastBadge from '../LastBadge'
import './BadgesCarousel.scss'

class BadgesCarousel extends React.PureComponent {

  state={
    activeIndex: 0,
  }

  next = () => {
    const nextIndex = this.state.activeIndex === this.props.badges.length - 1 ? 0 : this.state.activeIndex + 1
    this.setState({ activeIndex: nextIndex })
  }

  previous = () => {
    const nextIndex = this.state.activeIndex === 0 ? this.props.badges.length - 1 : this.state.activeIndex - 1
    this.setState({ activeIndex: nextIndex })
  }

  goToIndex = (newIndex) => {
    this.setState({ activeIndex: newIndex })
  }

  render() {

  const { badges, patient } = this.props

  const slides = badges.map((badge) => {
    let days = dayjs(dayjs(badge.date)).fromNow()
    days = days.replace('da ','')
      return (
        <CarouselItem
          key={badge.id}
        >
          <div className='date-badge'>
            {days} fa
          </div>
          {badge.achievement === 'target' && <React.Fragment>
            <img src='/target.png' alt='Target' />
          </React.Fragment>}
          {badge.achievement === 'level' && <React.Fragment>
            <img src='/livello.png' alt='Livello' />
          </React.Fragment>}
          {badge.achievement === 'box' && <React.Fragment>
            <img src='/tema.png' alt='Tema' />
          </React.Fragment>}
          <div className='text-badge'>
            <LastBadge
              lastBadge={badge}
              patientName={patient.name}
            />
          </div>
        </CarouselItem>
      )
    })

    const activeIndex = this.state.activeIndex

    return (
      <div className='BadgesCarousel text-align-center'>
        <Carousel
        activeIndex={activeIndex}
        next={this.next}
        previous={this.previous}
      >
        {slides}
        <CarouselIndicators items={badges} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
      </Carousel>
      <br /> <br />
      </div>
    )
  }
}

export default BadgesCarousel
