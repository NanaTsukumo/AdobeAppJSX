# VS Code Settings for Adobe JSX Development

## 🛠️ Adobe JSX開発用 VS Code 設定

このファイルをワークスペースの `.vscode/settings.json` に追加することで、Adobe ExtendScript 開発を効率化できます。

```json
{
  // Adobe JSX 開発用設定
  "files.associations": {
    "*.jsx": "javascript",
    "*.jsxinc": "javascript"
  },
  
  // JavaScript 設定（ExtendScript 用に調整）
  "javascript.suggest.enabled": true,
  "javascript.validate.enable": false,
  "typescript.validate.enable": false,
  
  // エディタ設定
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.wordWrap": "on",
  "editor.rulers": [80, 120],
  
  // 拡張機能設定
  "extendscript.targetApplication": "illustrator-2024",
  
  // ファイルエクスプローラー除外パターン
  "files.exclude": {
    "**/.DS_Store": true,
    "**/Thumbs.db": true,
    "**/*.ai": true,
    "**/*.eps": true
  },
  
  // ブックマーク設定（Adobe ドキュメント用）
  "bookmarks.saveBookmarksInProject": true,
  
  // カスタム設定
  "window.title": "Adobe JSX - ${activeEditorShort}${separator}${rootName}",
  
  // Adobe リファレンス用クイックアクセス
  "workbench.startupEditor": "readme",
  
  // ターミナル設定
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  
  // 新機能：AGENTS.md を有効化
  "chat.useAgentsMdFile": true,
  
  // 新機能：チャット設定
  "chat.fontFamily": "Consolas, 'Courier New', monospace",
  "chat.fontSize": 14,
  
  // 新機能：ターミナル自動承認（Adobe スクリプト用）
  "chat.tools.terminal.enableAutoApprove": true,
  "chat.tools.terminal.autoApprove": [
    "node *.js",
    "code *.jsx",
    "explorer *.ai"
  ],
  
  // 新機能：ウィンドウボーダー色（Adobe 専用）
  "window.border": "#FF6B9D",
  
  // エディタタブにインデックス表示
  "workbench.editor.showTabIndex": true,
  
  // セカンダリサイドバーの表示設定
  "workbench.secondarySideBar.defaultVisibility": "visible"
}
```

## 🎯 推奨拡張機能リスト

VS Code の拡張機能設定ファイル（`.vscode/extensions.json`）

```json
{
  "recommendations": [
    // Adobe ExtendScript 開発必須
    "adobe.extendscript-debug",
    
    // JavaScript/TypeScript サポート
    "ms-vscode.vscode-typescript-next",
    
    // Git 管理
    "eamodio.gitlens",
    
    // ファイル管理
    "alefragnani.bookmarks",
    "ms-vscode.hexdump",
    
    // マークダウン
    "yzhang.markdown-all-in-one",
    "shd101wyy.markdown-preview-enhanced",
    
    // PDF プレビュー（ドキュメント参照用）
    "tomoki1207.pdf",
    
    // AI ツール（新機能対応）
    "ms-toolsai.jupyter",
    "github.copilot",
    "github.copilot-chat"
  ]
}
```

## ⌨️ カスタムキーバインド

VS Code のキーバインド設定（`.vscode/keybindings.json`）

```json
[
  // Adobe JSX 開発用ショートカット
  {
    "key": "f5",
    "command": "extendscript.debug.run",
    "when": "editorTextFocus && resourceExtname == '.jsx'"
  },
  {
    "key": "shift+f5",
    "command": "extendscript.debug.stop",
    "when": "debugType == 'extendscript'"
  },
  
  // ドキュメント参照用
  {
    "key": "ctrl+shift+d",
    "command": "workbench.action.openFolder",
    "args": "${workspaceFolder}/References"
  },
  
  // Adobe JSX ファイル作成
  {
    "key": "ctrl+alt+n",
    "command": "workbench.action.files.newUntitledFile",
    "args": { "languageId": "javascript" }
  },
  
  // チャット関連（新機能）
  {
    "key": "ctrl+shift+i",
    "command": "workbench.action.chat.open"
  },
  {
    "key": "ctrl+shift+a",
    "command": "workbench.action.chat.focusConfirmationAction"
  }
]
```

## 📋 タスク設定

Adobe JSX 開発用タスク（`.vscode/tasks.json`）

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run JSX in Illustrator",
      "type": "shell",
      "command": "explorer",
      "args": ["${file}"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Open Adobe References",
      "type": "shell",
      "command": "code",
      "args": ["${workspaceFolder}/References"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "silent",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Backup JSX Scripts",
      "type": "shell",
      "command": "xcopy",
      "args": [
        "\"${workspaceFolder}\\illustrator Scripts\\*.jsx\"", 
        "\"${workspaceFolder}\\Backup\\${input:timestamp}\\\"",
        "/I", "/Y"
      ],
      "group": "build",
      "windows": {
        "command": "cmd",
        "args": [
          "/c", 
          "xcopy \"${workspaceFolder}\\illustrator Scripts\\*.jsx\" \"${workspaceFolder}\\Backup\\%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%\\\" /I /Y"
        ]
      }
    }
  ],
  "inputs": [
    {
      "id": "timestamp",
      "description": "Current timestamp",
      "default": "backup",
      "type": "promptString"
    }
  ]
}
```

## 🎨 カラーテーマ設定

Adobe ブランドカラーを使用したカスタムテーマ設定

```json
{
  "workbench.colorCustomizations": {
    // Adobe ブランドカラー
    "titleBar.activeBackground": "#FF0000",
    "titleBar.activeForeground": "#FFFFFF",
    "activityBar.background": "#2D2D30",
    "activityBar.foreground": "#FF6B9D",
    
    // ExtendScript エディタ用
    "editor.background": "#1E1E1E",
    "editor.foreground": "#D4D4D4",
    "editor.selectionBackground": "#264F78",
    
    // ターミナル（Adobe カラー）
    "terminal.background": "#0C0C0C",
    "terminal.foreground": "#CCCCCC"
  },
  
  "editor.tokenColorCustomizations": {
    "comments": "#6A9955",
    "keywords": "#569CD6",
    "strings": "#CE9178",
    "functions": "#DCDCAA",
    "variables": "#9CDCFE"
  }
}
```

---

**これらの設定により、VS Code が Adobe JSX 開発に最適化され、新機能も活用できる環境が完成 ♡**