# 🎯 プロジェクト用設定ファイル作成ガイド

## 📂 設定ファイルの分離戦略

### 個人設定 vs プロジェクト設定

| ファイル種別 | 用途 | Git管理 |
|-------------|------|--------|
| `settings.json` | 個人環境設定 | ❌ 除外 |
| `settings.example.json` | プロジェクトサンプル | ✅ 管理 |
| `launch.json` | デバッグ設定（共有） | ✅ 管理 |
| `jsx.code-snippets` | コードテンプレート | ✅ 管理 |
| `*-theme.json` | 個人テーマ設定 | ❌ 除外 |

## 🔧 推奨セットアップ手順

### 1. 現在の設定をバックアップ
```bash
# 個人設定を保護
cp .vscode/settings.json .vscode/settings.local.json

# Adobe専用設定もバックアップ
cp .vscode/illustrator.settings.json .vscode/illustrator.local.json
cp .vscode/indesign.settings.json .vscode/indesign.local.json
cp .vscode/photoshop.settings.json .vscode/photoshop.local.json
```

### 2. プロジェクト共有用設定を作成
```bash
# 最小限のプロジェクト設定
cp .vscode/settings.json .vscode/settings.example.json

# Adobe設定のサンプル版
cp .vscode/illustrator.settings.json .vscode/illustrator.example.json
```

### 3. 新規開発者向けセットアップスクリプト
```bash
# setup.sh / setup.bat の作成
# 新規参加者が実行するだけで環境構築完了
```

## 📝 プロジェクト設定例

### settings.example.json の内容
```json
{
    "github.copilot.chat.systemPrompt": "SystemPrompts/auto-load.md",
    "files.associations": {
        "*.jsx": "javascript"
    },
    "editor.defaultFormatter": "esbenp.prettier-vscode"
    // 個人的なパス設定やカラー設定は除く
}
```

### README.md への追記
```markdown
## 🛠️ 初回セットアップ

1. リポジトリクローン後：
   ```bash
   cp .vscode/settings.example.json .vscode/settings.json
   cp .vscode/illustrator.example.json .vscode/illustrator.settings.json
   ```

2. 個人の環境に合わせて Adobe パス等を調整
```

## 🚨 注意事項

### 絶対にコミットしてはいけない情報
- Adobe インストールパス（個人環境依存）
- ウィンドウボーダー色（個人好み）
- ファイルパス設定（ユーザー名含む）
- API キーや認証情報
- 個人的なワークフロー設定

### コミットして良い情報
- ファイル関連付け設定
- 基本的なエディタ設定
- プロジェクト共通のコードスニペット
- デバッグ設定（パスを除く）

---

✨ **この分離によって、お兄さんの個人設定を守りながら、他の開発者にも優しいプロジェクトになるよ〜♡**