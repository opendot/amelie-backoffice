import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { getAuthUser } from "eazy-auth";
import { loadNotices, getNotices, updateNotice } from '../../state/notices'
import { handleSumbissionErrors } from '../../components/form/submitError'
import classNames from 'classnames'
import orderBy from 'lodash/orderBy'
import './Notifiche.scss'


class Notifiche extends React.PureComponent {


  componentDidMount(){
    this.props.loadNotices()
  }

  markNoticeAsRead = id => () => {
    this.props.updateNotice({id, read: true})
  }
  
  render() {
    const { notices } = this.props
    return (
      <React.Fragment>
        <div className="Impostazioni">
          <nav aria-label="breadcrumb" className="Breadcrumb">
            <ol className="breadcrumb d-flex justify-content-between align-items-center">
              <li className="breadcrumb-item ">
              Notifiche
              </li>
            </ol>
          </nav>
          <Container fluid>

            {!!notices && notices.length > 0 && <div>
              {orderBy(notices, x => -x.created_at).map(notice => (
                <div key={notice.id} className={classNames('d-flex alert', {'alert-info': !notice.read, 'alert-light': notice.read})}>
                  <div className="flex-1">
                    {notice.message}
                  </div>  
                  <div className="read-button-container">
                    {!notice.read && <button className="btn btn-outline-primary" onClick={this.markNoticeAsRead(notice.id)}>
                      Segna come già letto
                    </button>}
                  </div>
                </div>
              ))}
            </div>}
              
          </Container>
          
        </div>
        
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: getAuthUser(state),
  notices: getNotices(state),
  
});

export default connect(
  mapStateToProps,
  {
    loadNotices,
    updateNotice,
  }
)(Notifiche);
