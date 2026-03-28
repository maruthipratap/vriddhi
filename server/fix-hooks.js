const fs = require('fs');

let shopContent = fs.readFileSync('models/Shop.js', 'utf8');

shopContent = shopContent.replace(
  /shopSchema\.pre\('save',\s*async\s*function\s*\(next\)\s*\{([\s\S]*?)next\(\)\s*\r?\n\}\)/,
  'shopSchema.pre(\'save\', async function () {$1})'
);

shopContent = shopContent.replace(
  /shopSchema\.pre\(\/\^find\/,\s*function\s*\(next\)\s*\{([\s\S]*?)next\(\)\s*\r?\n\}\)/,
  'shopSchema.pre(/^find/, function () {$1})'
);

shopContent = shopContent.replace(
  /if \(!this\.getOptions\(\)\.includeDeleted\) \{/g,
  'const options = this.getOptions() || {};\n  if (!options.includeDeleted) {'
);

fs.writeFileSync('models/Shop.js', shopContent, 'utf8');
console.log('Shop updated successfully.');
