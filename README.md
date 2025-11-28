# SplitPic - 智能图片切割工具

一个高效、易用的Web图片切割工具，支持自定义比例切割，保持原图质量，批量下载。

## ✨ 功能特性

- 🖼️ **多格式支持**: 支持 JPG, PNG, GIF, WebP, BMP, TIFF, SVG 等主流图片格式
- ✂️ **自定义切割**: 支持 1×1 到 20×20 的任意比例切割
- 🎯 **高质量切割**: 使用 Canvas API 确保图片质量不下降
- 📥 **灵活下载**: 支持单个下载、选中下载和ZIP打包下载
- 🎨 **美观界面**: 现代化响应式设计，支持拖拽上传
- ⚡ **性能优化**: 大图片分块处理，避免浏览器崩溃
- 🔒 **本地处理**: 所有处理都在本地完成，保护隐私

## 🚀 快速开始

### 在线使用
🔗 **访问地址**: https://fubug.github.io/splitpic/

或直接打开 `index.html` 文件即可在浏览器中使用。

### 本地部署
```bash
# 克隆或下载项目
git clone https://github.com/your-username/splitpic.git
cd splitpic

# 使用任意HTTP服务器运行（推荐）
npx serve .  # 或使用 Python, PHP, Live Server 等

# 访问 http://localhost:3000
```

## 📖 使用说明

### 1. 上传图片
- **拖拽上传**: 直接将图片拖拽到上传区域
- **点击选择**: 点击"选择图片文件"按钮选择图片

### 2. 设置切割参数
- **行数**: 设置水平切割数量（1-20）
- **列数**: 设置垂直切割数量（1-20）
- **输出格式**: 选择 PNG, JPG 或 WebP 格式

### 3. 执行切割
- 点击"开始切割"按钮处理图片
- 系统会自动显示原图预览和切割结果

### 4. 下载结果
- **单个下载**: 点击切割块的下载按钮
- **选择下载**: 勾选多个切割块后点击"下载选中"
- **批量下载**: 点击"打包下载全部"获取ZIP文件

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **图片处理**: Canvas API + File API
- **UI设计**: CSS Grid + Flexbox（响应式）
- **依赖库**: 无外部依赖（可选JSZip用于打包下载）

## 📱 浏览器兼容性

| 浏览器 | 版本要求 | 支持状态 |
|--------|----------|----------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 12+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |

## ⚡ 性能优化

- **内存管理**: 大图片分块处理，避免内存溢出
- **异步处理**: 所有图片处理操作都是异步的
- **懒加载**: 按需生成预览图片
- **缓存优化**: 智能缓存处理结果

## 🎯 使用场景

- **表情包分离**: 从生成的大图中提取单个表情包
- **素材整理**: 将设计稿切割成独立素材
- **图片分割**: 制作拼图、卡片等切割需求
- **批量处理**: 快速处理大量图片切割任务

## 📝 开发说明

### 项目结构
```
splitpic/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── main.js           # 主逻辑
│   ├── imageProcessor.js # 图片处理核心
│   ├── utils.js          # 工具函数
│   └── zip-loader.js    # ZIP库加载器
├── assets/
│   └── icons/            # 图标资源
└── README.md             # 项目说明
```

### 核心类说明

#### `ImageProcessor`
图片处理核心类，负责：
- 图片加载和验证
- 图片切割和格式转换
- 文件下载和ZIP打包

#### `SplitPicApp`
主应用类，负责：
- UI交互和事件处理
- 文件上传和预览
- 用户状态管理

#### `ZipLoader`
动态加载器，负责：
- 按需加载JSZip库
- 优化初始加载性能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境设置
1. Fork 项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - 强大的图片处理能力
- [JSZip](https://stuk.github.io/jszip/) - ZIP文件创建库
- [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) - 现代化布局

## 📞 联系方式

如有问题或建议，欢迎：
- 提交 [Issue](https://github.com/your-username/splitpic/issues)
- 发送邮件至 your-email@example.com

---

**SplitPic** - 让图片切割变得简单高效！ 🚀
