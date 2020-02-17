import React from 'react'
import { connect } from 'react-redux'
import dayjs from 'dayjs'
import {
  loadGeoStats,
  unloadGeoStats,
  getGeoStats,
} from '../../state/patientDashboard'
import { DATE_FORMAT } from '../../consts'
import PatientsMap from '../../components/PatientsMap'

class MapStats extends React.Component {
  state = {
    scope: '',
    days: 30,
    plotValue: 'tot_absolute',
  }

  componentDidMount() {
    this.loadStats()
  }

  loadStats = () => {
    const { scope, days } = this.state

    const fromDate = dayjs()
    const toDate = dayjs().add(days, 'day')

    this.props.loadGeoStats({
      scope,
      from_date: fromDate.format(DATE_FORMAT),
      to_date: toDate.format(DATE_FORMAT),
    })
  }

  handleScopeChange = e => {
    this.setState({
      scope: e.target.value,
    }, this.loadStats)
  }

  handleDaysChange = e => {
    this.setState({
      days: e.target.value,
    }, this.loadStats)
  }

  handlePlotValueChange = e => {
    this.setState({
      plotValue: e.target.value,
    })
  }

  render() {
    const { geoStats } = this.props
    console.log('G 3 O', geoStats)
    return (
      <div>
        <div className='d-flex'>
          <div className='pr-2'>Mostra{' '}</div>
          <div className='pr-2'>
            <select value={this.state.plotValue} onChange={this.handlePlotValueChange}>
              <option value='tot_absolute'>num. sessioni totali</option>
              <option value='cog_absolute'>num. sessioni pot. cognitivo</option>
              <option value='com_absolute'>num. sessioni comunicatore</option>
            </select>
          </div>
          <div className='pr-2'>{' '}per{' '}</div>
          <div className='pr-2'>
            <select value={this.state.scope} onChange={this.handleScopeChange}>
              <option value={''}>regione</option>
              <option value={'provinces'}>provincia</option>
            </select>
          </div>
          <div className='pr-2'>{' '}durante{' '}</div>
          <div><select value={this.state.days} onChange={this.handleDaysChange}>
            <option value={30}>gli ultimi 30 giorni</option>
            <option value={60}>gli ultimi 60 giorni</option>
          </select></div>
        </div>
        <div style={{height: 550}}>
          <PatientsMap data={geoStats} plotValue={this.state.plotValue}/>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  geoStats: getGeoStats(state),
}), {
  loadGeoStats,
  unloadGeoStats,
})(MapStats)
