import React from "react";
import range from "lodash/range";
import { PaginationItem, PaginationLink } from "reactstrap";

const Paginator = ({ numPages, currentPage, goToPage }) => (
  <nav aria-label="pagination">
    <ul className="pagination pagination-lg justify-content-center my-3">
      <PaginationItem disabled={!currentPage || currentPage === 1}>
        <PaginationLink previous onClick={() => goToPage(currentPage - 1)} />
      </PaginationItem>
      {range(numPages).map(page => (
        <PaginationItem key={page} active={page + 1 === currentPage}>
          <PaginationLink onClick={() => goToPage(page + 1)}>
            {page + 1}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem disabled={!currentPage || !(currentPage < numPages)}>
        <PaginationLink next onClick={() => goToPage(currentPage + 1)} />
      </PaginationItem>
    </ul>
  </nav>
);

export default Paginator;
