

var config = {
  apm_server: process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200',
  apm_service_name: process.env.ELASTIC_APM_SERVICE_NAME || 'react-petclinic',
  apm_service_version: process.env.ELASTIC_APM_SERVICE_VERSION || '1.0.0',
  api_server: process.env.API_SERVER || 'http://localhost:8000',
  api_prefix: process.env.API_PREFIX || '/petclinic/api'
}

module.exports = config;
