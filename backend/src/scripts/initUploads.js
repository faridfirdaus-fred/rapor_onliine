import fs from 'fs';
import path from 'path';

// Ensure upload directories exist
const directories = [
  'uploads',
  'uploads/profiles'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`✓ Directory exists: ${dir}`);
  }
});

// Create .gitkeep to preserve folders in git
directories.forEach(dir => {
  const gitkeepPath = path.join(dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
    console.log(`✅ Created .gitkeep in: ${dir}`);
  }
});

console.log('\n✅ Upload directories initialized!');
