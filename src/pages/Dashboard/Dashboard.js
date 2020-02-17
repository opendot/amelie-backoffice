import React from 'react'
import { getAuthUser } from 'eazy-auth'
import { connect } from 'react-redux'
import CareReceiversDashboardList from './CareReceiversDashboardList'
import MapStats from './MapStats'

class Dashboard extends React.Component {
  render() {
    const { user } = this.props
    return (
      <div>
        <nav aria-label="breadcrumb" className="Breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              Dashboard dati
            </li>
          </ol>
        </nav>
        <div className='container-fluid'>
          <div className='row'>
            {user.type === 'Superadmin' && (
              <div className='col-md-6'>
                <MapStats />
              </div>
            )}
            <div className={`col-md-${user.type === 'Superadmin' ? 6 : 12} border-left`}>
              <h3 className='mb-4'>Seleziona care receiver</h3>
              <CareReceiversDashboardList />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  user: getAuthUser(state),
}))(Dashboard)
