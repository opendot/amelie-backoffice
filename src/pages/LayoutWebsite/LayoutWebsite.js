import React from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import "./LayoutWebsite.scss";

const LayoutWebsite = ({ children }) => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-10">
          {children}
          <div className="row">
            <div className="col-12 bg-light">
              <Footer />
            </div>
          </div>
        </div>
        <div className="col-2 bg-dark">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default LayoutWebsite;
