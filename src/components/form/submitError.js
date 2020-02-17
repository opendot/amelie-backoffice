import { SubmissionError } from 'redux-form'
import { get } from 'lodash'

export const handleSumbissionErrors = errorResponse => {
  // Bad form
  if (errorResponse.status === 400 || errorResponse.status === 422 ) {
    const errors = get(errorResponse, 'response.body.errors')
    throw new SubmissionError(errors)
  } else {
    throw new SubmissionError({_error: 'Api error. Try later.'})
  }
}