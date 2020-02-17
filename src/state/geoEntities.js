import combineRjs from "redux-rocketjump/plugins/combine"
import positionalArgs from "redux-rocketjump/plugins/positionalArgs"
import { rj } from "redux-rocketjump/rocketjump"
import request from 'superagent'
import { API_URL } from "../consts";
import { authApiCall, withToken } from "./auth";

const config = {};

const GET_REGIONS = 'GET_REGIONS'
const GET_PROVINCES = 'GET_PROVINCES'
const GET_CITIES = 'GET_CITIES'

config.regions = rj(
    {
        type: GET_REGIONS,
        callApi: authApiCall,
        api: t => () => withToken(t, request.get(`${API_URL}/geoentities`)).then(({ body }) => body),
        
    }
)

config.provinces = rj(
  positionalArgs(),
  {
      type: GET_PROVINCES,
      callApi: authApiCall,
      api: t => (region) => withToken(t, request.get(`${API_URL}/geoentities`)).query({parent: region}).then(({ body }) => body),
      
  }
)

config.cities = rj(
  positionalArgs(),
  {
      type: GET_CITIES,
      callApi: authApiCall,
      api: t => (province) => withToken(t, request.get(`${API_URL}/geoentities`)).query({parent: province}).then(({ body }) => body),
      
  }
)



export const {
  connect: {
    regions: {
        actions: {
          load: loadRegions,
          unload: unloadRegions,
        },
        selectors: {
          getData: getRegions,
        }
    },
    provinces: {
      actions: {
        load: loadProvinces,
        unload: unloadProvinces,
      },
      selectors: {
        getData: getProvinces,
      }
    },
    cities: {
      actions: {
        load: loadCities,
        unload: unloadCities,
      },
      selectors: {
        getData: getCities,
      }
    },

  },
  reducer,
  saga
} = combineRjs(config, { state: 'geoEntities' })