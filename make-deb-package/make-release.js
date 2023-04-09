'use strict';

const fs = require('fs');
const cp = require('child_process');
const toml = require('toml');

if (process.cwd() !== __dirname) {
  console.error(`must run in ${__dirname} directory`);
  process.exit(1);
}

// this will fail if we're not in the make-deb-package directory
const cargoDotTomlText = fs.readFileSync('../Cargo.toml', 'utf8');

const cargoDotToml = toml.parse(cargoDotTomlText);

const { version, authors, description } = cargoDotToml.package;

if (authors.length != 1) {
  console.error('must have only one author');
  process.exit(1);
}

const author = authors.pop();

//+
// now let's make the debian package
//-

// this is the destination on the target system
const packageRoot = `./hello-wenxin_${version}_amd64`;
const targetDir = `${packageRoot}/usr/local/bin`;
const debianDir = `${packageRoot}/DEBIAN`;
const controlFile = `${debianDir}/control`;

// make the directories
fs.mkdirSync(packageRoot, {recursive: true});
fs.mkdirSync(targetDir, {recursive: true});
fs.mkdirSync(debianDir, {recursive: true});

// now write the control file
const control = [
  'Package: hello-wenxin',
  `Version: ${version}`,
  'Architecture: amd64',
  `Maintainer: ${author}`,
  `Description: ${description}
    This is the really long description.`,
  ''
].join('\n');

fs.writeFileSync(controlFile, control, 'utf8');

// copy the binary.
cp.execSync(`cp ../target/release/hello-wenxin ${targetDir}/`);

// execute the command to make the package
cp.execSync(`dpkg-deb --build --root-owner-group ${packageRoot}`);
