import React from 'react'
import range from 'lodash/range'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap'

const Paginator = ({ numPages, currentPage, goToPage, className = 'd-flex justify-content-center' }) => (
  <Pagination className={className}>
    <PaginationItem disabled={currentPage === null || currentPage === 1}>
      <PaginationLink previous onClick={() => goToPage(currentPage - 1)}/>
    </PaginationItem>
    {range(1, numPages + 1).map(page => (
      <PaginationItem key={page} active={page === currentPage}>
        <PaginationLink onClick={() => goToPage(page)}>
          {page}
        </PaginationLink>
      </PaginationItem>
    ))}
    <PaginationItem disabled={currentPage === null || !((currentPage) < numPages)}>
      <PaginationLink next onClick={() => goToPage(currentPage + 1)}/>
    </PaginationItem>
  </Pagination>
)

export default Paginator
