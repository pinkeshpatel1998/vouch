import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is a stray lockfile in the home directory; pin the root explicitly.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
