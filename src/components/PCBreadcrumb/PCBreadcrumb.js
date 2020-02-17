import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getBox } from '../../state/boxes';
import { getLevel } from '../../state/levels';
import { getTarget } from '../../state/targets';
import './PCBreadcrumb.scss';

class PCBreadcrumb extends Component {
  render() {
    const { match, box, level, target } = this.props;
    const { params } = match;

    return (
      <nav aria-label="breadcrumb" className="Breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            {params.levelId ? (
              <Link
                to={{
                  pathname: '/potenziamento-cognitivo',
                  state: { transition: 'slide-right' }
                }}
              >
                Potenziamento cognitivo
              </Link>
            ) : (
              'Potenziamento cognitivo'
            )}
          </li>
          {level &&
            level.id.toString() === params.levelId && (
              <React.Fragment>
                <li className="breadcrumb-item">
                  {params.boxId ? (
                    <Link
                      to={{
                        pathname: `/potenziamento-cognitivo/level/${level.id}`,
                        state: { transition: 'slide-right' }
                      }}
                    >
                      {level.name}
                    </Link>
                  ) : (
                    level.name
                  )}
                </li>
                {box &&
                  box.id.toString() === params.boxId && (
                    <React.Fragment>
                      <li className="breadcrumb-item">
                        {params.targetId ? (
                          <Link
                            to={{
                              pathname: `/potenziamento-cognitivo/level/${
                                level.id
                              }/box/${box.id}`,
                              state: { transition: 'slide-right' }
                            }}
                          >
                            {box.name}
                          </Link>
                        ) : (
                          box.name
                        )}
                      </li>
                      {target &&
                        target.id.toString() === params.targetId && (
                          <React.Fragment>
                            <li className="breadcrumb-item">{target.name}</li>
                          </React.Fragment>
                        )}
                    </React.Fragment>
                  )}
              </React.Fragment>
            )}
        </ol>
      </nav>
    );
  }
}

const mapStateToProps = state => ({
  level: getLevel(state),
  box: getBox(state),
  target: getTarget(state)
});

export default withRouter(connect(mapStateToProps)(PCBreadcrumb));
