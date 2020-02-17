import React from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { scaleLinear } from 'd3-scale'
import get from 'lodash/get'
import sum from 'lodash/sum'
import './PatientsMap.scss'

const position = [42, 11.4]

class PatientsMap extends React.Component {

  state = {
    maxBounds: undefined,
  }

  componentDidMount(){
    const maxBounds = this.map.leafletElement.getBounds()
    this.setState({maxBounds})
  }

  render(){
    const { data, plotValue } = this.props
    const values = get(data, 'features', []).map(feature => get(feature.properties, plotValue))
    const maxValue = sum(values) || 0
    const opacityScale = scaleLinear().domain([0, maxValue]).range([0, 1])

    return <div className="d-flex flex-column h-100 mt-3 border rounded patients-map">
      <Map 
        ref={node => this.map = node}
        zoomSnap={0.1} 
        center={position} zoom={5.5} 
        minZoom={5.2} 
        maxBounds={this.state.maxBounds} 
        boundsOptions={{padding: [100, 100]}}
        className="w-100 flex-1">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        <GeoJSON data={data} key={JSON.stringify(data)} style={ feature => {
          return {
            fillColor: '#2DC268',
            fillOpacity: opacityScale(get(feature.properties, plotValue)),
            weight: 1.5,
            color: '#666',
            
          }
        }}/>
      </Map>
      <div className="p-2">
        <div className="legend">
          <div className="bar"></div>
          <div className="bar-text">
            <span>0</span>
            {!!maxValue && <span>{maxValue}</span>}
          </div>
        </div>
      </div>
    </div>
    
  }
}

PatientsMap.defaultProps = {
  plotValue: 'tot_absolute',
}

export default PatientsMap