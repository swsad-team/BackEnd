# BackEnd

## 使用

需安装 `NodeJS LTS`

```bash
git clone https://github.com/swsad-team/BackEnd.git
# 使用 npm 安装依赖
npm install
# 使用 yarn 安装依赖
yarn
```

### 脚本

- `npm start`

  启动服务器

- `npm run start-dev`

  启动测试服务器 （保存后自动重新运行）

- `npm run debug`

  调试

- `npm run lint`

  使用 `eslint` 进行代码风格检查

- `npm run test`

  进行测试

- `npm run compile`

  将源代码编译为 `commonJS` 模块

### 调试

- 使用 VSCode 进行调试

  按 `F5` 开始调试

### 开发

开发时请避免在 `master` 分支上进行操作。请先新建 `dev` 分支并以 Pull Request 的方式提交进主分支。

### CI

master 分支会自动部署至生产服务器。

## 项目结构
