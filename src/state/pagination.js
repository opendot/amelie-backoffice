import qs from 'query-string'

const airettPaginationAdapter = {
  list: 'body',
  count: resp => +resp.headers.total,
  previous: resp => {
    const currentPage = qs.parse(qs.extract(resp.req.url)).page || 1
    const page = currentPage > 1 ? currentPage - 1 : null
    return { page }
  },
  next: resp => {
    const currentPage = qs.parse(qs.extract(resp.req.url)).page || 1
    const perPage = +resp.headers['per-page']
    const total = +resp.headers.total
    const numPages = Math.ceil(total / perPage)
    const page = currentPage < numPages ? currentPage + 1 : null
    return { page }
  },
  current: ({page}) => ({ page: +page || 1})
}

export default airettPaginationAdapter
