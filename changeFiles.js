// readme:从playerfiles中替换AB文件到tank

//example  node changeFiles [playerANum] [playerBNum]
// node changeFiles 01 02

const fs = require('fs')
const path = require('path')
const playerDirPath = path.resolve('./playerfiles/');
const tankDirPath = path.resolve('./tank/js/');

const args = process.argv.splice(2)

const playerANum = args[0]
const playerBNum = args[1]

console.log(playerANum,'playerANum')
console.log(playerBNum,'playerBNum')


function copyFile() {
  fs.readdir(playerDirPath, {withFileTypes: true}, (err, files) => {
      if (err) {
          console.warn(err)
      } else {
          // 遍历读取到的文件列表
          files.forEach(function(file) {
              if (file.isDirectory()) {
                  const fileName  = file.name;
                  if(fileName.split('.')[0] === playerANum){
                    // 拷贝文件
                    fs.copyFile(`${playerDirPath}/${fileName}/playerA.js`, `${tankDirPath}/playerA.js`, (err) => {
                      if (err) throw err;
                    });
                    console.log(`${playerDirPath}/${fileName}/playerA.js`)
                  }else if(fileName.split('.')[0] === playerBNum){
                    // 拷贝文件
                    fs.copyFile(`${playerDirPath}/${fileName}/playerB.js`, `${tankDirPath}/playerB.js`, (err) => {
                      if (err) throw err;
                    });
                    console.log(`${playerDirPath}/${fileName}/playerB.js`)
                  }
              }
          });
      }
  })
}

copyFile()