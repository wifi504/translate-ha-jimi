# 哈基密语 Next

![version](https://img.shields.io/badge/version-3.0.0-blue) ![license](https://img.shields.io/badge/license-GPLv3-green) ![vue](https://img.shields.io/badge/vue-3.5.x-4FC08D) ![last-commit](https://img.shields.io/github/last-commit/wifi504/translate-ha-jimi) ![stars](https://img.shields.io/github/stars/wifi504/translate-ha-jimi?style=social)

哈基米加密器 Next 版本，融合了 `v1.0` 与 `v2.0` 的所有功能，现在可以更方便、更优雅的使用。

点击前往：[哈基密语 Next](https://lhlnb.top/hajimi)

## 📖 还不算介绍的介绍 developing...

### 简单的架构设计：

- monorepo的重构，把原来的老前端工程变成子模块
- 哈基密语的API单独写一个模块，用于发布
- 哈基密语Next版本前端工程，单独模块，使用API来开发，解耦
- 哈基密语浏览器脚本的前端工程，也是单独模块，也依赖API，到时候扔油叉
- Java和Python的工程，直接在独立子文件夹自行管理，monorepo排除就行了，毕竟也就提供几个简单的方法，新开仓库感觉没必要

### 要做的一些补充：

- 配置好环境变量和别的配置信息，把跟项目无关的数据解耦合不要写死在代码

- 自动注入git提交sha，这样构建后能够浏览器端追踪项目版本，顺便也把版本号注入

- 脚注信息展示结构化

  ```
  第一行块：带图标的超链接
  第二行块：友情链接， “|” 分隔
  第三行块：版权信息、版本信息
  第四行块：备案信息、额外信息
  ```

- 整个页面纯白背景可以优化，加点好看的背景图，用矢量图绘制

### 待实现功能清单：

- [ ] JavaScript API库
- [ ] Next版本全新前端
  - [ ] 能自适应的banner
  - [ ] 全局的404页面
  - [x] 新的脚注信息展示，自动注入版本号等
  - [ ] 对二进制文件的加密支持
  - [ ] 要在密钥交换后加一步哈基函数校验
- [ ] 油猴脚本，让浏览器可以自动处理哈基密文
- [ ] Java、Python平台API库

## 🚀 使用

- 在使用前，你可能需要先了解有关的专有名词

  | 名称       | 含义                                                         | 名称由来                                                     |
  | ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | 哈基密文   | 通过 `哈基编解码器` 处理的Uint8Array数据流                   | B站 `v1.0` 版视频中天才网友 [ZhangHB_321688](https://space.bilibili.com/488486599) 的评论 |
  | 哈基密语   | 文本数据经过加密后，再执行哈基解码得到的哈基密文             |                                                              |
  | 哈基密密语 | 文本数据先经过压缩，然后经过加密，再执行哈基解码得到的哈基密文 |                                                              |
  | 哈基密钥   | 进行加解密的对称密钥、密钥交换的公钥参数等数据经过哈基解码得到的哈基密文 |                                                              |
  | 哈基密码   | 用来解密用户浏览器本地的加密密钥的凭证                       | B站《曼波教你密码学系列#01》视频天才网友 [yes_teRd_ay](https://space.bilibili.com/152106169) 评论 |
  | 哈基函数   | 使用哈基米实现的 `hashcode()` 函数                           | B站 `v1.0` 版视频中天才网友 [Ga_Zer](https://space.bilibili.com/325379055) 的评论 |
  | 基密文件   | 二进制文件，如图片视频等经过压缩和加密后，执行哈基解码得到的哈基密文 | B站 `v2.0` 版视频中天才网友 [保安总监德穆兰](https://space.bilibili.com/3493117265185483) 评论 |
  | 哈呀库     | 哈基密文各平台API库（JavaScript、Java、Python）              | B站《曼波教你密码学系列#01》视频天才网友 [弹幕职人](https://space.bilibili.com/9611100) 评论 |

## 🛠️ 本地部署

部署……

## 📚 API 文档

这个板块到时候抽出去成独立的

### 安装依赖

#### 1. JavaScript

首先，运行如下命令导入哈呀库

```
pnpm install hayalib
```

接下来按如下即可使用

```
示例代码
```

#### 2. Java

首先，在 `pom.xml` 里引入哈呀库

```
maven GAV 标签
```

接下来按如下即可使用

```
示例代码
```

#### 3. Python

首先，运行如下命令安装哈呀库

```
pip install hayalib
```

接下来按如下即可使用

```
示例代码
```

### 全部方法

- 直接把字符串转换成哈基密文

  方法名：`stringToHaJimi(形参)`

  形参列表：

  | 形参名 | 类型   | 说明         |
  | ------ | ------ | ------------ |
  | text   | String | 要转换的文本 |

  返回值：

  String

- 把哈基密文直接转换成字符串

……

## 🧩 技术栈

列出来

## 🤝 贡献者

好像是有个东西显示贡献者来着，鼓励大家一起加功能，提pr

## ⭐ 星星历史

![Star History Chart](https://api.star-history.com/svg?repos=wifi504/translate-ha-jimi&type=Date)

## 📜 开源协议

这里除了此项目开源协议，所有引用的也都写进来
