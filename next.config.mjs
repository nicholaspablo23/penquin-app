/** @type {import('next').NextConfig} */
const nextConfig = {
// Keep Turbopack off so we use Webpack (more stable with our deps)
experimental: {
webpackBuildWorker: false,
},

// Webpack customization
webpack: (config) => {
// Tell Webpack to ignore the React Native async storage module
// that MetaMask SDK tries to optionally import.
config.resolve = config.resolve || {};
config.resolve.alias = {
...(config.resolve.alias || {}),
'@react-native-async-storage/async-storage': false,
};

return config;
},
};

export default nextConfig