import { PureComponent, createElement } from 'react'
import defaults from 'lodash/defaults'
import debounce from 'lodash/debounce'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import get from 'lodash/get'
import omitBy from 'lodash/omitBy'
import isEqual from 'lodash/isEqual'
import mapValues from 'lodash/mapValues'
import qs from 'query-string'
import hoistStatics from 'hoist-non-react-statics'


const arrayze = a => Array.isArray(a) ? a : [a]
const identity = a => a

const strObjValues = obj => mapValues(obj, v =>
  typeof v === 'undefined' || v === null ? v : `${v}`
)

export default function withDataTable(c = {}) {

  const config = {
    filters: [],
    queryString: true,
    transformParams: identity,
    ...c,
  }

  // FIXME: Rewrite this hell please bro
  const filtersConfig = config.filters.map(arrayze)
  const filtersConfigMap = filtersConfig.reduce((config, f) => ({
    ...config,
    [f[0]]: defaults(get(f, '[1]', {}), {
      defaultValue: '',
      omitWhenEmpty: false,
    }),
  }), {})

  return function wrapWithDataTable(WrappedComponent) {
    class DataTable extends PureComponent {
      constructor(props) {
        super(props)
        if (!config.queryString) {
          // Use React state as source of truth otherwise use query string!
          this.state = {
            params: {
              ...this.getDefaultFilters(),
              page: 1,
            }
          }
        } else {
          // Initi \w empty params
          this.state = { params: {} }
        }
      }

      componentDidMount() {
        if (config.queryString)  {
          // When query string save the current value to state
          // for future compare
          const params = this.getParams()
          this.setState({
            params,
          }, () => {
            this.loadItems(params)
          })
        } else {
          this.loadItems(this.getParams())
        }
      }

      componentDidUpdate(prevPros) {
        // Compare query string params \w current params
        // when mismatch means user change query string manually
        // \w back/forward browser
        // so reload items according to new params
        if (config.queryString && this.props.location.search !== prevPros.location.search) {
          const qsParams = qs.parse(this.props.location.search)
          // Cast all values to string to avoid bad compare
          if (!isEqual(strObjValues(qsParams), strObjValues(this.state.params))) {
            this.setState({
              params: qsParams,
            }, () => {
              this.loadItems(qsParams)
            })
          }
        }
      }

      componentWillUnmount() {
        const { unloadItems } = this.props
        if (typeof unloadItems === 'function') {
          unloadItems()
        }
      }

      getDefaultFilters = () => {
        const defaultFilters = filtersConfig.reduce((defaults, f) => {
          const filterField = f[0]
          const filterConfig = filtersConfigMap[filterField]
          const defaultFilterValue = typeof filterConfig.defaultValue === 'function'
            ? filterConfig.defaultValue(this.props)
            : filterConfig.defaultValue
          return {
            ...defaults,
            [filterField]: defaultFilterValue,
          }
        }, {})
        return defaultFilters
      }

      getParams = () => {
        const defaultParams = {
          ...this.getDefaultFilters(),
          page: 1,
        }
        const baseParams = config.queryString
          ? qs.parse(this.props.location.search)
          : this.state.params

        return defaults(baseParams, defaultParams)
      }

      loadItems = (params = {}) => {
        const loadParams = omitBy(
          params,
          (v, k) => !v && get(filtersConfigMap, `${k}.omitWhenEmpty`, false)
        )
        return this.props.loadItems(config.transformParams(loadParams, this.props))
      }

      updateParams = (params, debounced = false) => {
        const { location } = this.props
        this.setState({ params }, () => {
          if (config.queryString) {
            this.props.history.push({
              pathname: location.pathname,//`${location.pathname}?${qs.stringify(params)}`,
              search: `${qs.stringify(params)}`,
              state: { preventAnimation: true}

            })
          }
          if (debounced) {
            this.loadItemsDebounced(params)
          } else {
            this.loadItems(params)
          }
        })
      }

      updateParam = (name, value, debounced = false) => {
        const currentParams = this.getParams()
        const nextParams = {
          ...currentParams,
          // Reset page ... until name is page eheh
          page: 1,
          [name]: value,
        }
        const onFilterUpdate = get(filtersConfigMap, `${name}.onUpdate`, identity)
        this.updateParams(onFilterUpdate(nextParams, value), debounced)
      }

      clearFilters = () => {
        this.updateParams({
          ...this.getDefaultFilters(),
          page: 1,
        })
      }

      reload = () => this.loadItems(this.getParams())

      loadItemsDebounced = debounce(this.loadItems, 150)

      goToPage = page => this.updateParam('page', page)

      areFiltersActive = () => {
        const currentFilters = omit(this.getParams(), 'page')
        return !isEqual(currentFilters, this.getDefaultFilters())
      }

      makeFiltersProp = () => {
        const params = this.getParams()
        return filtersConfig.reduce((r, f) => {
          const [filterName, ] = f
          const value = params[filterName]
          const onChange = (e, debounced = true) =>
            this.updateParam(filterName, get(e, 'target.value', e), debounced)

          return {
            ...r,
            [filterName]: {
              value,
              onChange,
            }
          }
        }, {})
      }

      render() {
        const params = this.getParams()
        const { page } = params
        const filters = this.makeFiltersProp()
        const filtersActive = this.areFiltersActive()

        return createElement(WrappedComponent, {
          ...this.props,
          params,
          page: +page,
          filters,
          filtersActive,
          loadItems: this.loadItems,
          clearFilters: this.clearFilters,
          reload: this.reload,
          goToPage: this.goToPage,
        })
      }
    }

    const name = WrappedComponent.displayName || WrappedComponent.name
    const EnhancedComponent = hoistStatics(DataTable, WrappedComponent)
    EnhancedComponent.displayName = `withDataTable(${name})`
    return EnhancedComponent
  }
}
