
const path = require('path');
const fs = require('fs');
const febs = require('febs');
const rollup = require('rollup');

const rollupTypescript2 = require('rollup-plugin-typescript2');
const rollupResolve = require('@rollup/plugin-node-resolve');
const rollupCommonjs = require('@rollup/plugin-commonjs');
const rollupMinify = require('rollup-plugin-babel-minify');
// const babel = require('rollup-plugin-babel');
const version = require('../package.json').version;

let external = [
    ]
let globals = {
}

const banner =(name)=>
  '/*!\n' +
  ` * ${name} v${version}\n` +
  ' * Copyright (c) 2020 Copyright bp All Rights Reserved.\n' +
  ' * Released under the MIT License.\n' +
  ' */\n'

function build(pkg, dir) {

  let libName = getLibName(pkg, dir);
  let inputMain = getInputMain(pkg, dir);

  let plugins = [
        rollupResolve({
          extensions: ['.js', '.ts'],
          preferBuiltins: false,
        }),
        rollupTypescript2({
          tsconfig: path.join(__dirname, '..', `tsconfig.json`),
        }),
      ];

  let build = ()=>rollup.rollup({
      input: inputMain,
      plugins: plugins,
      external
    })
  
  // let buildMin = ()=>rollup.rollup({
  //     input: inputMain,
  //     plugins: plugins.concat(
  //       rollupMinify({
  //         comments: false,
  //         banner: banner(pkg),
  //         sourceMap: false,
  //       })),
  //     external
  //   })

  let bundleUmd = (bundle, min)=>{bundle.write({
        globals: globals,
        file: path.join(__dirname, '..', `${dir}/index.${min?'min.':''}js`),
        format: 'umd',
        name: libName,
        sourcemap: !min,
      });
      return bundle;
  }
  let bundleCjs = (bundle, min)=>{bundle.write({
        globals,
        file: path.join(__dirname, '..', `${dir}/index.common.${min?'min.':''}js`),
        format: 'cjs',
        name: libName,
        sourcemap: !min,
      });
      return bundle;
  }
  let bundleEsm = (bundle, min)=>{bundle.write({
        globals,
        file: path.join(__dirname, '..', `${dir}/index.esm.${min?'min.':''}js`),
        format: 'esm',
        name: libName,
        sourcemap: !min,
      });
      return bundle;
  }

  let p = [];

    // umd (iife)
    // build().then(bundle => bundleUmd(bundle, false))
    //         .then(bundle => bundleCjs(bundle, false))
    //         .then(bundle => bundleEsm(bundle, false)),
  // umd minify
  if (febs.file.fileIsExist(inputMain)) {
    p.push(build().then(bundle => bundleUmd(bundle, false))
              .then(bundle => bundleCjs(bundle, false))
              .then(bundle => bundleEsm(bundle, false))
              .then(res=>{
                if (dir == 'concurrent') {
                  return febs.file.fileCopyAsync(
                    path.join(__dirname, '..', 'src', dir, 'index.d.ts'), 
                    path.join(__dirname, '..', dir, 'types', 'index.d.ts'));
                }
              }).then(res=>{}));
  }

  return Promise.all(
    p
  ).then(febs.utils.sleep(500));
}

function getLibName(pkg, dir) {
  if (dir == 'standard')
    return pkg;
  else {
    return pkg + '_concurrent';
  }
}

function getInputMain(pkg, dir) {
  if (!fs.existsSync(path.join(__dirname, '..', dir))) {
    fs.mkdirSync(path.join(__dirname, '..', dir))
  }

  if (dir == 'concurrent') {
    if (!fs.existsSync(path.join(__dirname, '..', dir, 'types'))) {
      fs.mkdirSync(path.join(__dirname, '..', dir, 'types'))
    }
  }

  let inputMain = path.join(__dirname, '..', `src/${dir}/index.ts`);
  return inputMain;
}

build('febsFSM', 'standard')
.then(res=>build('febsFSM', 'concurrent')).catch(e=>{console.error(e)})