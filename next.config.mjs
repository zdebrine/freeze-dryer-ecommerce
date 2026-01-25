/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "7h5xvtepdiugpp9l.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
 
}

export default nextConfig
