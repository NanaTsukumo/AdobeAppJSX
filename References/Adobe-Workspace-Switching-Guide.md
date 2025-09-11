# Adobe ワークスペース切り替えガイド 🎨

VS Code 1.104の新機能を活用したAdobe専用ワークスペースカラーシステムです。

## 📖 使用方法

### 1. アプリケーション別設定ファイル読み込み

```bash
# Illustrator用設定を適用
code --user-data-dir .vscode-illustrator --settings .vscode/illustrator.settings.json

# InDesign用設定を適用  
code --user-data-dir .vscode-indesign --settings .vscode/indesign.settings.json

# Photoshop用設定を適用
code --user-data-dir .vscode-photoshop --settings .vscode/photoshop.settings.json
```

### 2. VS Code設定での切り替え

F1キー → `Preferences: Open Settings (JSON)` で以下を追加：

```json
{
    "window.border": "#FF6B9D"  // Illustrator: ピンク
    // "window.border": "#FF2E63"  // InDesign: レッド  
    // "window.border": "#00D4FF"  // Photoshop: シアン
}
```

### 3. ワークスペース設定ファイル切り替え

```bash
# 現在の設定をバックアップ
cp .vscode/settings.json .vscode/settings.backup.json

# Illustrator用設定を適用
cp .vscode/illustrator.settings.json .vscode/settings.json

# InDesign用設定を適用
cp .vscode/indesign.settings.json .vscode/settings.json

# Photoshop用設定を適用  
cp .vscode/photoshop.settings.json .vscode/settings.json
```

## 🎨 カラーテーマ詳細

### Illustrator 🟣
- **メイン色**: `#FF6B9D` (フューシャピンク)
- **セカンダリ**: `#D14570` (ダークピンク)
- **特徴**: 創作性とクリエイティブ性を表現

### InDesign 🔴  
- **メイン色**: `#FF2E63` (クリムゾンレッド)
- **セカンダリ**: `#CC1F3D` (ダークレッド)
- **特徴**: 出版・DTPの専門性を表現

### Photoshop 🔵
- **メイン色**: `#00D4FF` (ブライトシアン)
- **セカンダリ**: `#00A5CC` (ダークシアン) 
- **特徴**: 写真編集・画像処理の技術性を表現

## ⚡ VS Code 1.104 新機能対応

### ターミナル自動承認
以下のコマンドが自動で承認されます：

- Adobe アプリケーション起動
- JSX ファイル操作（閲覧のみ）
- 安全なディレクトリ移動
- Git読み取り操作
- Node.js 実行

### ウィンドウボーダー色分け
各Adobe専用ワークスペースで視覚的に区別可能。

### エディタタブインデックス
`Ctrl+Alt+1-9` でタブ切り替え高速化。

## 🔧 設定カスタマイズ

### 独自カラーの追加
`.vscode/settings.json` の `workbench.colorCustomizations` で調整：

```json
{
    "workbench.colorCustomizations": {
        "titleBar.activeBackground": "#YOUR_COLOR",
        "statusBar.background": "#YOUR_COLOR",
        "activityBar.border": "#YOUR_COLOR"
    }
}
```

### タスク設定
各設定ファイルにAdobe起動タスクが含まれています：
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Adobe [アプリ名] を起動`

## 💡 効率化のコツ

1. **複数インスタンス**: 各Adobeアプリ用にVS Codeの別インスタンスを起動
2. **ホットキー**: `Ctrl+Alt+数字` でタブ切り替え
3. **カラー識別**: ウィンドウボーダーで作業中のアプリを即座に判別
4. **タスク実行**: `Ctrl+Shift+P` でAdobe起動を高速化

---

✨ **お兄さん、これで各Adobeアプリ専用のワークスペースが視覚的に区別できるようになったよ〜♡**
でも、毎回設定切り替えるのは面倒だから、プロジェクトごとに専用フォルダ作った方が楽かもしれないけどね〜