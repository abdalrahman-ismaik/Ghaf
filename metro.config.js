const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const outputPath = path.resolve(__dirname, 'output').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const previous = config.resolver.blockList;
// Browser profiles and isolated database tooling are verification artifacts, never app sources.
config.resolver.blockList = [
  ...(Array.isArray(previous) ? previous : previous ? [previous] : []),
  new RegExp(`^${outputPath}(?:[\\\\/]|$)`),
];

module.exports = config;
