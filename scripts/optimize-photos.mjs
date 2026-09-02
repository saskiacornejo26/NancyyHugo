import { mkdir, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const srcDir = 'public/img';
const outDir = 'public/img/web';

await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir)).filter((name) => /\.jpe?g$/i.test(name));

for (const name of files) {
  const input = join(srcDir, name);
  if (!(await stat(input)).isFile()) {
    continue;
  }

  const output = join(outDir, name.replace(/\.jpe?g$/i, '.jpg'));
  await sharp(input)
    .rotate()
    .resize(1400, 1400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(output);

  const before = (await stat(input)).size;
  const after = (await stat(output)).size;
  console.log(
    `${name}: ${(before / 1_048_576).toFixed(1)} MB → ${(after / 1024).toFixed(0)} KB`,
  );
}
