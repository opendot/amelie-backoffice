import React from "react";
import { Container, Card, CardHeader, CardBody, Row, Col } from "reactstrap";
import { withAuthLogin } from "eazy-auth";
import {Link} from "react-router-dom";

let Login = ({
  handleSubmit,
  credentials: { email, password },
  error,
  loading
}) => (
  <Container fluid className="pt-5 mt-5">
    <Row>
      <Col sm={{ size: 4, offset: 4 }}>
        <Card>
          <CardHeader className="bg-dark text-white">Airett - Login</CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="inputEmail">{"Indirizzo Email"}</label>
                <input
                  {...email}
                  type="email"
                  id="inputEmail"
                  className="form-control"
                  placeholder={"Indirizzo Email"}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="inputPassword">{"Password"}</label>
                <input
                  {...password}
                  type="password"
                  id="inputPassword"
                  className="form-control"
                  placeholder={"Password"}
                />
              </div>
              <div className="mt-2 text-center">
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
              </div>
              {loading && <div>Login...</div>}
              {error && <div>Bad credentials</div>}
            </form>

            <Link to="/recover" className="nav-link">
              Hai dimenticato la password?
            </Link>

          </CardBody>
        </Card>
      </Col>
    </Row>
    <div className="mt-5 d-flex align-items-center justify-content-center" />
  </Container>
);
export default withAuthLogin({
  credentials: ["email", "password"]
})(Login);
