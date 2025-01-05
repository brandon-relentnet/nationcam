/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,

    async redirects() {
        return [
            {
                source: '/venicemarina',
                destination: '/locations/sublocations/venice-marina',
                permanent: true, // Use true for a 301 redirect
            },
        ];
    },
};

export default nextConfig;
