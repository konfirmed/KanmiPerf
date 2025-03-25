#!/bin/bash

set -e

echo "📦 Installing dependencies..."
npm install

echo "🛠 Building all packages..."
npm run build

echo ""
echo "🚀 Publishing kanmi-perf..."
cd packages/kanmi-perf
npm publish --access public
cd ../..

echo ""
echo "🚀 Publishing kanmi-perf-pro..."
cd packages/kanmi-perf-pro
npm publish --access public
cd ../..

echo ""
echo "✅ All packages published successfully!"
