/** @type {import('next').NextConfig} */
const nextConfig = {
// Force Vercel to use Webpack instead of Turbopack
experimental: {
turbo: {
loaders: {
".js": false,
".jsx": false,
".ts": false,
".tsx": false,
},
},
},
webpack: (config) => {
return config;
},
};

export default nextConfig;