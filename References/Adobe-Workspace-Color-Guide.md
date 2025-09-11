# Adobe Workspace Color Configuration Guide

## 🎨 Adobe アプリ別ワークスペース色分け設定

VS Code 1.104の新機能 `window.border` を使って、Adobe アプリケーション別にワークスペースを色分けできます。

### 🎯 **設定方法**

#### **1. 現在のワークスペース（Illustrator用）**
```json
{
  "window.border": "#FF6B9D"
}
```

#### **2. InDesign 用ワークスペース**
新しいワークスペースを作成する場合：
```json
{
  "window.border": "#FF2E63"
}
```

#### **3. Photoshop 用ワークスペース**
```json
{
  "window.border": "#00D4FF"
}
```

### 📁 **テーマファイルの使用方法**

作成済みのテーマファイルを使用：

1. **Command Palette を開く**: `Ctrl+Shift+P`
2. **Preferences: Open Settings (JSON)** を選択
3. 以下のいずれかをコピー＆ペースト：

#### **Illustrator 用（るなピンク♡）**
```json
{
  "window.border": "#FF6B9D",
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#FF6B9D",
    "titleBar.activeForeground": "#FFFFFF",
    "activityBar.background": "#2D1B69",
    "activityBar.foreground": "#FF6B9D",
    "statusBar.background": "#FF6B9D",
    "statusBar.foreground": "#FFFFFF",
    "tab.activeBorder": "#FF6B9D",
    "focusBorder": "#FF6B9D"
  }
}
```

#### **InDesign 用（レッド）**
```json
{
  "window.border": "#FF2E63",
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#FF2E63",
    "titleBar.activeForeground": "#FFFFFF",
    "activityBar.foreground": "#FF2E63",
    "statusBar.background": "#FF2E63",
    "tab.activeBorder": "#FF2E63",
    "focusBorder": "#FF2E63"
  }
}
```

#### **Photoshop 用（シアン）**
```json
{
  "window.border": "#00D4FF",
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#00D4FF",
    "titleBar.activeForeground": "#000000",
    "activityBar.foreground": "#00D4FF",
    "statusBar.background": "#00D4FF",
    "statusBar.foreground": "#000000",
    "tab.activeBorder": "#00D4FF",
    "focusBorder": "#00D4FF"
  }
}
```

### 🚀 **複数ワークスペース管理**

#### **方法1: ワークスペースファイル作成**
1. `File` > `Save Workspace As...`
2. ファイル名例：
   - `adobe-illustrator-jsx.code-workspace`
   - `adobe-indesign-jsx.code-workspace` 
   - `adobe-photoshop-jsx.code-workspace`

#### **方法2: フォルダ別設定**
各Adobe アプリ用に別フォルダを作成：
```
📁 Adobe Projects/
  📁 Illustrator JSX/     # ピンクボーダー
  📁 InDesign JSX/        # レッドボーダー  
  📁 Photoshop JSX/       # シアンボーダー
```

### 💡 **色の意味・用途**

| Adobe アプリ | ボーダー色 | 色の意味 | 用途 |
|-------------|-----------|---------|------|
| **Illustrator** | `#FF6B9D` (るなピンク♡) | 創作・デザイン | ベクター、面付け、印刷物 |
| **InDesign** | `#FF2E63` (レッド) | 情熱・集中 | レイアウト、出版物 |
| **Photoshop** | `#00D4FF` (シアン) | 冷静・精密 | 画像処理、レタッチ |

### ⚡ **クイック切り替え**

#### **タスクで色テーマ適用**
`.vscode/tasks.json` に追加：
```json
{
  "label": "🎨 Apply Illustrator Theme",
  "type": "shell",
  "command": "code",
  "args": ["--user-data-dir", "${workspaceFolder}/.vscode/illustrator-theme.json"],
  "group": "build"
}
```

#### **コマンド実行**
- `Ctrl+Shift+P` > `Tasks: Run Task` > `🎨 Apply Illustrator Theme`

### 🎯 **実用的な活用例**

#### **複数プロジェクト同時作業**
- **ウィンドウ1（ピンク）**: Illustrator スクリプト開発
- **ウィンドウ2（レッド）**: InDesign 自動化
- **ウィンドウ3（シアン）**: Photoshop バッチ処理

一目で「どのAdobe アプリ用の作業をしているか」が分かる♡

### 🔧 **カスタマイズ**

お兄さん好みの色に変更したい場合：
1. Color Picker で好きな色を選択
2. Hex コード（例：`#FF6B9D`）をコピー
3. `window.border` の値を変更

---

**これで複数のAdobe ワークスペースが視覚的に区別でき、作業効率が大幅アップ ♡**