# ✨ 愿景显化App · UI设计规范（至臻版）

> 交给AI改代码用。风格一句话：**暖白渐变底 + 精致金强调 + 极致留白 + 呼吸感光球 + 五级灰度文字**

---

## 色彩系统 (Color System)

### 背景层
| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-primary` | `#FDFDFB → #F9F9F7` (线性渐变) | 页面主背景，从上到下微暖渐变 |
| `--bg-card` | `#FFFFFF` | 卡片、气泡、输入区域背景 |

### 文字层（五级灰度）
| Token | 值 | 用途 |
|-------|-----|------|
| `--text-primary` | `#2A2A2A` | 主标题、正文 |
| `--text-secondary` | `#4A4A4A` | 副标题 |
| `--text-tertiary` | `#6A6A6A` | 辅助信息 |
| `--text-quaternary` | `#8A8A8A` | 次要信息 |
| `--text-disabled` | `#ABABAB` | 禁用状态、placeholder |

### 强调层（金色系）
| Token | 值 | 用途 |
|-------|-----|------|
| `--accent` | `#C9A961` | 精致金，选中态/图标/文字强调 |
| `--accent-gradient` | `#D4AF37 → #C9A961` | CTA按钮渐变填充 |
| `--accent-glow` | `rgba(201,169,97,0.3)` | 光球外发光/按钮阴影 |
| `--orb-inner` | `#F4E4C1` | 精灵光球内层（径向渐变起点） |
| `--orb-outer` | `#D4AF37` | 精灵光球外层（径向渐变终点） |

### 边框层
| Token | 值 | 用途 |
|-------|-----|------|
| `--border-light` | `#F0F0F0` | 极浅分割线 |
| `--border-standard` | `#E8E8E8` | 标准边框 |
| `--border-medium` | `#DADADA` | 中等边框、未选中输入框 |
| `--border-focus` | `#C9A961` | 聚焦态输入框边框（变金色） |

---

## 阴影系统 (Shadow System)

| 层级 | 值 | 用途 |
|------|-----|------|
| Subtle | `0 2px 8px rgba(0,0,0,0.04)` | 卡片默认态 |
| Standard | `0 2px 16px rgba(0,0,0,0.06)` | 浮起卡片、弹窗 |
| Elevated | `0 4px 24px rgba(0,0,0,0.08)` | 重要CTA、模态 |
| Gold Glow | `0 4px 16px rgba(201,169,97,0.3)` | 精灵光球、金色CTA按钮 |

---

## 圆角系统 (Radius System)

| 层级 | 值 | 用途 |
|------|-----|------|
| Small | `6px` | checkbox圆角 |
| Medium | `16px` | 按钮、输入框、气泡 |
| Large | `24-28px` | 卡片 |
| XLarge | `32px` | 图片容器 |
| Pill | `999px` | 胶囊标签、时间选择器 |

---

## 间距系统 (Spacing System)

8px基础网格：`8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 56 / 64 px`

- 页面水平padding：`24px`
- 组件间纵向间距：`24-32px`
- 卡片内padding：`20-24px`
- 底部Tab高度：`64px`（含安全区）

---

## 排版系统 (Typography)

### 字号层级
| 用途 | 字号 | 字重 |
|------|------|------|
| 大标题 | `22px` | `500` |
| 页面标题 | `18-20px` | `400-500` |
| 正文/镜像文案 | `16px` | `300-400` |
| 辅助文字 | `14px` | `300` |
| 标签/小字 | `12px` | `400` |
| 极小注释 | `11px` | `300` |

### 行高
| 场景 | 行高 |
|------|------|
| 标题 | `1.6` |
| 镜像文案/长文 | `2.0-2.4`（关键，要有呼吸感） |
| 按钮/标签 | `1.4` |

### 字重
- `200` — 超细（装饰性大字）
- `300` — 细（正文、辅助）
- `400` — 常规（正文、标签）
- `500` — 中等（标题、CTA文字）

---

## 组件规范

### 精灵光球 (Orb)
```css
.orb {
  width: 72px; /* 引导页 */
  /* Loading页放大到96px */
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #F4E4C1, #D4AF37);
  box-shadow: 0 4px 16px rgba(201,169,97,0.3);
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}
```

### CTA按钮
```css
.btn-cta {
  width: calc(100% - 48px);
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(90deg, #D4AF37, #C9A961);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(201,169,97,0.3);
  border: none;
}
```

### 标签选择器 (Tag Pills)
```css
.tag {
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid #E8E8E8;
  color: #4A4A4A;
  font-size: 14px;
  background: transparent;
}
.tag.selected {
  border-color: #C9A961;
  color: #C9A961;
  font-weight: 500;
}
```

### 选项条 (Radio Options)
```css
.option-row {
  height: 64px;
  padding: 0 20px;
  border: 1px solid #F0F0F0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.option-row.selected {
  border-color: #C9A961;
}
.radio-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #DADADA;
}
.radio-dot.selected {
  background: #C9A961;
  border-color: #C9A961;
}
```

### 聊天气泡
```css
.bubble-user {
  background: #F5F5F5;
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  max-width: 75%;
  align-self: flex-end;
}
.bubble-spirit {
  background: #FFFFFF;
  border: 1px solid #F0F0F0;
  border-radius: 16px 16px 16px 4px;
  padding: 12px 16px;
  max-width: 75%;
  align-self: flex-start;
}
```

### 底部Tab栏
```css
.tab-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 64px;
  background: #FFFFFF;
  border-top: 1px solid #F0F0F0;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.tab { color: #ABABAB; font-size: 11px; }
.tab.active { color: #C9A961; }
```

### 图片卡片 (Page 2 滑动)
```css
.swipe-card {
  width: 86%;
  aspect-ratio: 3/4;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}
.swipe-card-stack-1 { transform: scale(0.95); opacity: 0.6; }
.swipe-card-stack-2 { transform: scale(0.90); opacity: 0.3; }
```

---

## 动效规范

| 场景 | 动画 | 参数 |
|------|------|------|
| 精灵呼吸 | scale + opacity | 3s ease-in-out infinite |
| 页面过渡 | fade + slide-up | 0.3s ease-out |
| 卡片滑动 | translateX + rotate | 带弹性 (spring) |
| 选中反馈 | scale bounce | 0.95→1.0, 0.2s |
| Loading光线 | rotate | 8条光线45°间隔，2s linear infinite |
| 打字机文案 | 逐字显现 | 每字50-80ms |

---

## 图片风格指引

- **摄影风格：** 柔和自然光、浅景深、温暖色调、专业级质感
- **色调：** 偏暖，米色/木色/白色为主，不要冷色调
- **场景：** 斯堪的纳维亚风格室内、自然光窗边、植物点缀
- **人物：** 专业瑜伽/冥想/阅读/工作，米色/白色服装
- **质感：** 像高端生活方式杂志的插图

---

## 禁忌清单

- ❌ 深色/暗黑背景
- ❌ 高饱和度彩色（蓝/红/绿）
- ❌ 方正硬边卡片
- ❌ 密集信息排布
- ❌ 传统方框输入框
- ❌ 红色警告/错误色
- ❌ 数字进度百分比
- ❌ deadline/日期提醒样式
- ❌ 任何制造焦虑的UI元素

---

*v1.0 · 2026-05-10 · Hackathon至臻版*
