const path = require('path');
const webpack = require('webpack');

const port = process.env.PORT || 3000;
const apm_server_url = process.env.APM_SERVER_URL || 'http://localhost:8200';
const apm_service_name = process.env.APM_SERVICE_NAME || 'react-petclinic';
const apm_service_version = process.env.APM_SERVICE_VERSION || '1.0.0';

const entries = [
  './src/main.tsx'
];


module.exports = {
  devtool: 'source-map',
  entry: entries,
  output: {
    path: path.join(__dirname, 'public/dist/'),
    filename: 'bundle.js',
    publicPath: '/dist/'
    /* redbox-react/README.md */
    // ,devtoolModuleFilenameTemplate: '/[absolute-resource-path]'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
       __API_SERVER_URL__: JSON.stringify('http://localhost:8080'),
       __APM_SERVER_URL__: JSON.stringify(apm_server_url),
       __APM_SERVICE_NAME__: JSON.stringify(apm_service_name),
       __APM_SERVICE_VERSION__: JSON.stringify(apm_service_version)
    })
  ],
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js']
  },
  resolveLoader: {
    'fallback': path.join(__dirname, 'node_modules')
  },
  module: {
    preLoaders: [
      {
        test: /\.tsx?$/,
        loader: 'tslint',
        include: path.join(__dirname, 'src')
      }
    ],
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.less$/,
        loader: 'style!css!less',
        include: path.join(__dirname, 'src/styles')
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url?limit=25000'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file?name=public/fonts/[name].[ext]'
      },

      {
        test: /\.tsx?$/,
        loader: 'babel!ts',
        include: path.join(__dirname, 'src')
      }
    ]
  },
  tslint: {
    emitErrors: true,
    failOnHint: true
  }
};
