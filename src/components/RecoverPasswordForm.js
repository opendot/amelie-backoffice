import React from 'react'
import {Button, Alert, Input, Form, Card, CardHeader, CardBody, Col, Row, Container} from 'reactstrap'
import { withPasswordRecover } from 'eazy-auth'


let RecoverPasswordForm = ({
                               onSubmitRecoverPassword,
                               recoverEmail,
                               onRecoverEmailChange,
                               // Is email valid?
                               isRecoverEmailValid,
                               // Is password recovered?
                               recovered,
                               // Recover failure error (wrong email or server error)
                               recoverError,
                               // IS recovering in progress?
                               recoverLoading,
                           }) => (
    <Container fluid className="pt-5 mt-5">
        <Row>
            <Col sm={{ size: 4, offset: 4 }}>
        <Form className="form-group" onSubmit={onSubmitRecoverPassword}>
            {/* {error && <Alert color="error">Bad credentials</Alert>} */}
            <div className="d-flex flex-column align-items-center">
                <Card>
                    <CardHeader className="bg-dark text-white">Airett - Recupero password</CardHeader>
                    <CardBody>
                <Input
                    placeholder="Utente"
                    className="form-control"
                    type="email"
                    autoFocus
                    value={recoverEmail}
                    onChange={onRecoverEmailChange}
                />
                        <div className="mt-2 text-center">
                <Button type="submit" className="btn btn-primary" disabled={recoverLoading || !isRecoverEmailValid}>
                    {recoverLoading ? 'Invio in corso...' : 'Invia mail'}
                </Button>
                        </div>
                {!recoverError && !recovered &&
                <Alert className="invisible m-4 font-13 p-2">Placeholder</Alert>
                }
                {recoverError && <Alert className="m-4 font-13 p-2" color="danger">
                    {'La mail che hai inserito non è associata ad alcun account, riprova o contatta il supporto'}
                </Alert>}
                {recovered && <Alert className="m-4 font-13 p-2" color="success">
                    {'Link di recupero password inviato correttamente'}
                </Alert>}
                    </CardBody>
                </Card>
            </div>
        </Form>
            </Col>
        </Row>
    </Container>
)

export default withPasswordRecover()(RecoverPasswordForm)