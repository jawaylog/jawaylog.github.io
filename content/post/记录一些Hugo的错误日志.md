---
title: "记录一些Hugo的错误日志"
date: 2022-10-03T16:07:16+08:00
tags: [hugo]
categories: [折腾吧]
featured: true
---

**注意：** 这里记录的是hugo运行过程中发生的错误与解决方法。

运营之中，难免会发生各种各样的问题，也经常要搜索各种问题答案，归档起来，也方便些。

### 问题1
```
fatal: unable to access 'https://github.com/nunocoracao/blowfish.git/': OpenSSL SSL_read: Connection was reset, errno 10054 
```
![Featured Blowfish image](1.jpg)

产生原因：一般是这是因为服务器的SSL证书没有经过第三方机构的签署，所以才报错
参考网上解决办法：解除ssl验证后，再上传就OK了
<!--more-->
```
git config --global http.sslVerify "false"
```


 



