const path = require('path');
const cpus = require('os').cpus;

const webpack = require('webpack');
const { 
  HotModuleReplacementPlugin, 
  LoaderOptionsPlugin, 
  NamedModulesPlugin, 
  NewModule 
} = webpack;

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HappyPack = require('happypack');


const webpackConfig = (additionalOptions = {}) => {

  const options = Object.assign({}, {
    outputFolder:'example',
    environment:'development',
    index: false,
    sourceMaps: false,
    debug: false,
    cache: false,
    hmr: false,
    compress: false,
    minify: false,
  }, additionalOptions)

  const sourceFolder = path.join(__dirname, 'example');
  const babelOptions = {
    cacheDirectory: options.cache ? '.babel-cache' : undefined,
    presets: ['flow', 'react', 'babel-preset-env']
  };

  // (numberOfCpus - 1x current cpu) / 2x plugins needing threads
  const threadDistributionCount = Math.max(1, Math.floor((cpus().length - 1) / 2));

  const config = {
    // What code to build and where to put it
    entry: compact([
      options.hmr && 'react-hot-loader/patch',
      path.join(sourceFolder, 'index.tsx')
    ]),
    output: {
      path: path.join(__dirname, options.outputFolder),
      filename: 'bundle.js'
    },

    // Most webpack configs are controlled by our options
    stats: options.stats,
    cache: options.cache,
    devtool: options.sourceMaps ? 'source-map' : undefined,

    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },

    // Teach webpack how to load various modules
    module: {
      rules: [
        // Code (More config on HappyPack plugins below)
        {test: /\.tsx?$/, loader: 'happypack/loader?id=ts'},
      ]
    },
    plugins: compact([
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(options.environment)
        }
      }),

      new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true,
        workers: threadDistributionCount,
        watch: [sourceFolder]
      }),
      new HappyPack({
        id: 'ts',
        threads: threadDistributionCount,
        loaders: compact([
          options.hmr && 'react-hot-loader/webpack',
          {path: 'ts-loader', query: {
            happyPackMode: true,
            transpileOnly: true, // Disable type checker (ForksTsChecker is doing it in a separate thread)
            compilerOptions: {
              sourceMap: options.sourceMaps,
              module: 'esnext'
            }
          }}
        ])
      }),

      // Optional features
      options.hmr && new NamedModulesPlugin(),
      options.hmr && new HotModuleReplacementPlugin(),
      options.debug && new LoaderOptionsPlugin({debug: true}),
      options.minify && new UglifyJsPlugin()
    ]),
    devServer: {
      hot: options.hmr,
      contentBase: path.join(__dirname, "example"),
      compress: true,
      port: 8080      
    }
  };

  // Loaders should only be applied to project sources
  for (const rule of config.module.rules) {
    rule.exclude = /node_modules/;
  }

  return config;
}

const compact = (array) => {
  return array.filter((item) => item);
}

module.exports = {
  default: webpackConfig
};