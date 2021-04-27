module.exports = {
  verbose: true,
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  globals: {
    NODE_ENV: "test"
  },
  moduleFileExtensions: ["js"],
  moduleDirectories: ["node_modules", "app"],
  modulePaths: ["app"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|scss)$": "identity-obj-proxy",
    grpc: "<rootDir>/test/mock/grpc.js"
  },
  transformIgnorePatterns: [
    "/node_modules/", "\\.pnp\\.[^\\\/]+$", "app/middleware/walletrpc/"
  ]
};
