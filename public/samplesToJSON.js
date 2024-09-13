const dirTree = require("directory-tree");
const fs = require('fs');

// 构建目录树
const tree = dirTree("./public/samples");

// 编译函数，递归处理目录树
function compile(array) {
    return array.map(({path, name, children}) => {
        if (children) {
            return compile(children);
        } else {
            const [_, ext] = name.split(".");
            // 检查文件扩展名是否为音频格式
            return ['wav', 'aif', 'mp3'].includes(ext) 
                ? path.slice(6) // 移除 'public'
                : false;
        }
    }).filter(path => path); // 过滤掉非音频文件
}

// 检查目录树和子节点是否有效
if (tree && tree.children) {
    // 编译样本
    const samples = JSON.stringify(compile(tree.children).flat(128));

    // 写入文件
    fs.writeFile('./public/samples/samples.json', samples, 'utf8', (err) => {
        err
            ? console.log(`Error writing file: ${err}`)
            : console.log(`File is written successfully!`);
    });
} else {
    console.error("No valid samples found in the directory or directory is empty.");
    process.exit(1); // 退出程序
}
