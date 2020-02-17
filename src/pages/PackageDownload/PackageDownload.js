import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import { getAuthUser } from "eazy-auth";
import PackageDownloadForm from '../../components/PackageDownloadForm'
import {
  loadRegions,
  unloadRegions,
  getRegions,
  
} from "../../state/geoEntities";
import {createDownload, 
  getDownloadLoading, 
  getDownloadMessage, getDownloadError 
} from '../../state/downloads'
import { handleSumbissionErrors } from '../../components/form/submitError'


class PackageDownload extends React.PureComponent {


  componentDidMount(){
    this.props.loadRegions()
  }

  
  render() {
    const { downloadLoading, downloadMessage, user } = this.props
    return (
      <React.Fragment>
        <div className="PackageDownload">

          <nav aria-label="breadcrumb" className="Breadcrumb">
            <ol className="breadcrumb d-flex justify-content-between align-items-center">
              <li className="breadcrumb-item ">
              Package
              </li>
            </ol>
          </nav>

          <Container fluid>

          {!!user && <PackageDownloadForm 
              regions={this.props.regions}
              initialValues={{name: user.name, surname: user.surname, email: user.email}}
              onSubmit={(downloadData) => {
                console.log(downloadData)
                return this.props.createDownload(downloadData).catch(handleSumbissionErrors)
              }}
            />}

            {downloadLoading && <div> LOADING!

            </div>}
                      
          </Container>
          
        </div>
        
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: getAuthUser(state),
  regions: getRegions(state),
  downloadLoading: getDownloadLoading(state),
  downloadMessage: getDownloadMessage(state),
  downloadError: getDownloadError(state),
});

export default connect(
  mapStateToProps,
  {
    loadRegions,
    unloadRegions,
    createDownload,

  }
)(PackageDownload);
