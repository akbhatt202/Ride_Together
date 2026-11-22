const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(targetPath)) {
  let content = fs.readFileSync(targetPath, 'utf8');
  if (!content.includes('@rollup/wasm-node')) {
    content = content.replace(
      'const requireWithFriendlyError = id => {\n\ttry {\n\t\treturn require(id);\n\t} catch (error) {',
      'const requireWithFriendlyError = id => {\n\ttry {\n\t\treturn require(id);\n\t} catch (error) {\n\t\ttry {\n\t\t\treturn require(\'@rollup/wasm-node/dist/native.js\');\n\t\t} catch (wasmErr) {}'
    );
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('[RideTogether] Applied Rollup WASM compatibility patch.');
  }
}
