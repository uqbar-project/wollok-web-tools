const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    game:'./src/game/game-index.ts',
    dynamicDiagram: './src/dynamicDiagram/diagram-index.ts',
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: { 'console': false }
  },
  plugins: [
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ['*.LICENSE.txt'],
    })
  ],
  optimization: {
    minimize: true
  },
  output: {
    filename: '[name]-index.js',
    path: path.resolve(__dirname, 'dist', 'web'),
  },
  watchOptions: {
    ignored: '/node_modules/',
  },
};