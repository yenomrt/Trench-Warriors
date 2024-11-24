const path = require('path');
const webpack = require('webpack');  // Import webpack

module.exports = {
  entry: './src/index.js', // Your main entry file
  output: {
    path: path.resolve(__dirname, 'public/js'), // Output path for bundled JavaScript
    filename: 'bundle.js', // The bundled output filename
    library: 'myLibrary', // Optional: to expose some methods or objects globally
    libraryTarget: 'var',
  },
  resolve: {
    // Allow importing from node_modules without specifying the file extension
    extensions: ['.js'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"), // Add fallback for crypto
      "stream": require.resolve("stream-browserify"), // Add fallback for stream
      "buffer": require.resolve("buffer"), // Add fallback for buffer
    },
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/, // Exclude node_modules from transpiling
        use: {
          loader: 'babel-loader', // Use Babel to transpile JavaScript
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    // Provide polyfills for Buffer and process
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
