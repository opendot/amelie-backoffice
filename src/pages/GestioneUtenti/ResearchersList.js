import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";
import withDataTable from "../../hocs/withDataTable";
import { withRouter } from "react-router";
import Paginator from "./Paginator";
import MaterialIcon from "material-icons-react";
import ConfirmDelete from "./ConfirmDelete";
import UserCreateModal from "../../components/UserCreateModal";
import { updateUser } from "../../state/users";

class ResearchersList extends React.Component {
  state = {
    editUser: null
  };

  editUser = user => () => {
    this.setState({ editUser: user });
  };

  cancelEditUser = () => {
    this.setState({ editUser: null });
  };

  render() {
    const {
      users,
      page,
      numPages,
      goToPage,
      filters,
      history,
      deleteUser,
      updateUser
    } = this.props;
    const { search } = filters;
    const { editUser } = this.state;
    return (
      <Container fluid>
        <div className="row py-2">
          <div className="col col-sm-3">
            <input
              className={`form-control`}
              name="search"
              placeholder={"Search here"}
              value={search.value}
              onChange={search.onChange}
            />
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>

              <th className="w-25" />
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map(user => (
                <tr
                  className="pointer"
                  key={user.id}
                  // onClick={() => history.push(`/gestione-utenti/${user.code}`)}
                >
                  <td>
                    {user.name} {user.surname}
                  </td>
                  <td>{user.email}</td>

                  <td className="w-25">
                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        onClick={this.editUser(user)}
                        className="btn btn-light rounded-circle button-circle-lg mr-2 d-flex"
                      >
                        <MaterialIcon icon="edit" />
                      </button>
                      <ConfirmDelete
                        user={user}
                        onClick={() => {
                          deleteUser(user.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Paginator
          className="mx-auto"
          numPages={numPages}
          currentPage={page}
          goToPage={goToPage}
        />

        {editUser && (
          <UserCreateModal
            initialValues={editUser}
            onCancel={this.cancelEditUser}
            onSubmit={({ id, name, surname, email }) =>
              updateUser({ id, name, surname, email })
            }
            onSubmitSuccess={data => {
              this.cancelEditUser();
            }}
            isOpen={!!editUser}
            toggle={this.cancelEditUser}
          />
        )}
      </Container>
    );
  }
}

export default withRouter(
  withDataTable({
    filters: ["search"],
    queryString: true
  })(
    connect(
      undefined,
      { updateUser }
    )(ResearchersList)
  )
);
