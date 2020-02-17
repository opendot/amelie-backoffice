import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from "redux-form";
import { FieldInput, required } from "../form";
import { Form, Button } from "reactstrap";
import { loadRegions, loadProvinces, unloadRegions, unloadProvinces, getRegions, getProvinces, getCities } from '../../state/geoEntities'


class ProfileForm extends React.Component {



  render(){
    const { handleSubmit, error, valid, submitting  } = this.props
    return (
      <Form onSubmit={handleSubmit}>
           
           <Field
              label={'Nome'}
              name="name"
              validate={required}
              component={FieldInput}
              type="text"
            />

            <Field
              label={'Cognome'}
              name="surname"
              validate={required}
              component={FieldInput}
              type="text"
            />

            <Field
              label={'Email'}
              name="email"
              disabled
              validate={required}
              component={FieldInput}
              type="email"
            />

            {/* <Field
              label={'Password'}
              name="password"
              validate={required}
              component={FieldInput}
              type="text"
            /> */}

        {error && <div className="p-2"><div className="alert alert-danger">
          {error}
        </div></div>}

        <div>
          <button className="btn btn-primary" type="submit" disabled={!valid||submitting}>SALVA</button>
        </div>
          
      </Form>
    )
  }
}



ProfileForm = reduxForm({
  form: "ProfileForm",
})(ProfileForm);



export default ProfileForm