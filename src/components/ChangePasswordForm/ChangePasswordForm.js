import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from "redux-form";
import { FieldInput, required } from "../form";
import { Form, Button } from "reactstrap";
import { loadRegions, loadProvinces, unloadRegions, unloadProvinces, getRegions, getProvinces, getCities } from '../../state/geoEntities'


class ChangePasswordForm extends React.Component {



    render(){
        const { handleSubmit, error, valid, submitting  } = this.props
        return (
            <Form onSubmit={handleSubmit}>

                <Field
                    label={'Nuova password'}
                    name="password"
                    validate={required}
                    component={FieldInput}
                    type="text"
                />

                <Field
                    label={'Ripeti nuova password'}
                    name="password_confirmation"
                    validate={required}
                    component={FieldInput}
                    type="text"
                />


                {error && <div className="p-2"><div className="alert alert-danger">
                    {error}
                </div></div>}

                <div>
                    <button className="btn btn-primary" type="submit" disabled={!valid||submitting}>CAMBIA PASSWORD</button>
                </div>

            </Form>
        )
    }
}



ChangePasswordForm = reduxForm({
    form: "ChangePasswordForm",
})(ChangePasswordForm);



export default ChangePasswordForm