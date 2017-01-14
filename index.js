#!/usr/bin/env node

'use strict';

const __root = process.cwd();
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const program = require('commander');
const mkdirp = require('mkdirp');
const download = require('download-git-repo');

function list(val) {
  return val.split(',');
}

// 创建小程序工程
function initProj(name) {
  if(name === undefined) return;
  else {
    console.log("准备创建项目: " + name);

    var projPath = __root + '/' + name;
    if(!fs.existsSync(projPath)){
      download('kmokidd/wxapp-tmpl', __root+ '/' + name, function(err) {
        console.log(err ? err : '项目创建成功');
        // 创建成功以后，进入项目目录
        try {
          exec('pwd', function(){
            cwd:  __root+ '/' + name
          }, function(err, stdout, stderr){
            if(err) console.log(err);
            else console.log('进入项目目录');
          });
        }
        catch (err) {
          console.log(err);
        }

      });
    }else {
      console.warn(name + ' 项目已经存在，请使用别的名字');
    }
  }
}

// 创建新 page
function createNewPage(pages) {
  if(pages === undefined) return;
  else if(pages.length <= 0) console.log('请输入创建的 page 名');
  else {
    for (var index in pages){
      var page = pages[index];
      // 工程中的 pages 目录
      // 所以一定要 cd 到刚刚创建好的工程中
      var dir = __root + '/pages/';
      var pagePath = dir+page;
      // 如果不存在这个目录，创建之
      if(!fs.existsSync(pagePath)){
        console.log(pagePath);
        mkdirp(pagePath, function(err){
          if(err) { throw err; return;}
          else {
            console.log('成功创建 '+ page + '/');
            // 在该目录创建 page.wxml page.wxss page.js page.json
            fs.open(pagePath+'/'+page+'.wxml', 'w', function(){
              console.log('成功创建 '+ page + '.wxml 在目录 ' + pagePath);
            });
            fs.open(pagePath+'/'+page+'.wxss', 'w', function(){
              console.log('成功创建 '+ page + '.wxss 在目录 ' + pagePath);
            });
            fs.open(pagePath+'/'+page+'.js', 'w', function(){
              console.log('成功创建 '+ page + '.js 在目录 ' + pagePath);
            });
          }
        });

        // 将页面注册到 app.json 中
        registerPage(page);
      }
      // 不然就报个 log 说已经存在目录了不用创建
      else {
        console.warn(pages[index] + ' 已经存在，请使用别的名字');
      }
    }
  }
};

// 注册页面到 app.json 中
function registerPage(pageName) {
  var cfUrl = __root + '/app.json';

  fs.readFile(cfUrl, "utf8", function(err, data) {
    if (err) {
      console.log(err.toString());
    } else {
      var cont = JSON.parse(data.toString());
      if(cont.pages != undefined) {
        cont.pages.push('pages/' + pageName + '/' + pageName);

        fs.writeFile(cfUrl, JSON.stringify(cont), function(err) {
          if (err) throw err;
          else console.log("新页面已经写入配置");
        });
      }else {
        console.log('请先创建 pages 字段');
      }
    }
  });
};

// 删除页面的时候，也删掉 app.json 当中的配置
// ……
// 创建了一个页面就要负责，别删了= =

program
  .usage('[options] <file ...>')
  .option('-i, --init [value]', '创建初始项目')
  .option('-p, --newpage <items>', '输入要创建的页面名称，不带任何扩展名，自动生成目录和对应的 .wxml .wxss 和 .js 文件', list)
  .parse(process.argv);


initProj(program.init);
createNewPage(program.newpage);