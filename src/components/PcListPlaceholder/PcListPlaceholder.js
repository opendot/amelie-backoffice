import React from 'react';

const PcListPlaceholder = props => {
  return (
    <div className="PcList animation-placeholder">
      <div className="table-row header">
        <div className="column actions" />
        <div className="column title">
          <span className="title-placeholder" />
        </div>
        <div className="column status">
          <span className="title-placeholder" />
        </div>
        <div className="column info">
          <span className="title-placeholder" />
        </div>
        <div className="column actions">
          <span className="title-placeholder" />
        </div>
        <div className="column open" />
      </div>
      <div className="table-row placeholder" />
      <div className="table-row placeholder" />
      <div className="table-row placeholder" />
    </div>
  );
};

export default PcListPlaceholder;
