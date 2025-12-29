import path from "path";
import { fileURLToPath } from "url";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    game: "./src/game/game-index.ts",
    dynamicDiagram: "./src/dynamicDiagram/diagram-index.ts",
  },
  module: {
    rules: [
      {
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".mjs": [".mjs", ".mts"],
    },
    fallback: { console: false },
  },
  plugins: [
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ["*.LICENSE.txt"],
    }),
  ],
  optimization: {
    minimize: true,
  },
  output: {
    filename: "[name]-index.js",
    path: path.resolve(__dirname, "dist", "web"),
  },
  watchOptions: {
    ignored: "/node_modules/",
  },
};
