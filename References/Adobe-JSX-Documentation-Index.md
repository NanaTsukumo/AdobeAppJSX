# Adobe ExtendScript JSX Reference Documentation

## 📚 公式ドキュメント・リファレンス

### 🌟 **メインドキュメント** (最重要)

#### 1. **Adobe ExtendScript 総合ガイド**
- **URL**: https://extendscript.docsforadobe.dev/
- **内容**: ExtendScript の基本から応用まで網羅的なドキュメント
- **特徴**: 
  - VS Code デバッガー対応の説明
  - ScriptUI プログラミング詳細
  - ファイル操作・UI作成・エラーハンドリング
  - コード例が豊富

#### 2. **Adobe Illustrator Scripting Guide**
- **URL**: https://illustratorscripts.com/wp-content/uploads/2023/01/Illustrator-Scripting-Guide.pdf
- **内容**: Illustrator 専用スクリプティングガイド（PDF）
- **用途**: オブジェクト操作、座標計算、レイヤー管理

#### 3. **JavaScript Tools Guide** (GitHub)
- **Repository**: https://github.com/docsforadobe/javascript-tools-guide/
- **内容**: Adobe アプリケーション間でのスクリプティング共通機能
- **用途**: 基本概念理解、環境設定

---

## 🎯 **分野別リファレンス**

### **ScriptUI (ユーザーインターフェース)**
- **ダイアログ作成**: https://extendscript.docsforadobe.dev/user-interface-tools/
- **コントロール要素**: https://extendscript.docsforadobe.dev/user-interface-tools/types-of-controls/
- **イベント処理**: https://extendscript.docsforadobe.dev/user-interface-tools/defining-behavior-with-event-callbacks-and-listeners/
- **レイアウト管理**: https://extendscript.docsforadobe.dev/user-interface-tools/automatic-layout/

### **ファイル操作**
- **File & Folder オブジェクト**: https://extendscript.docsforadobe.dev/file-system-access/
- **ファイル読み書き**: https://extendscript.docsforadobe.dev/file-system-access/using-file-and-folder-objects/
- **エラーハンドリング**: https://extendscript.docsforadobe.dev/file-system-access/file-access-error-messages/

### **デバッグ・開発**
- **VS Code 拡張機能**: https://extendscript.docsforadobe.dev/vscode-debugger/
- **ExtendScript Toolkit**: https://extendscript.docsforadobe.dev/extendscript-toolkit/
- **コードプロファイリング**: https://extendscript.docsforadobe.dev/extendscript-toolkit/code-profiling-for-optimization/

### **Illustrator 固有機能**
- **アートボード操作**: 座標系、サイズ変更、配置
- **オブジェクト操作**: PathItem、TextFrame、GroupItem
- **カラー管理**: スウォッチ、グラデーション、パターン
- **エクスポート**: PDF、AI、その他形式

---

## 🛠️ **実用的なコード例・チュートリアル**

### **GitHub リポジトリ（参考スクリプト集）**
1. **creold/illustrator-scripts**
   - **URL**: https://github.com/creold/illustrator-scripts
   - **内容**: 実用的な Illustrator スクリプト集
   - **参考例**: アートボード操作、バッチ処理、カラー調整

2. **Community Scripts**
   - **Medium チュートリアル**: https://medium.com/@jtnimoy/illustrator-scripting-tutorial-d626297b1df7
   - **実践的ガイド**: https://metadesignsolutions.com/how-to-automate-adobe-illustrator-with-javascript-scripting-jsx-examples/

---

## 📖 **学習順序（推奨）**

### **初級（基本概念理解）**
1. ExtendScript 総合ガイドの Introduction
2. JavaScript Tools Guide の基本部分
3. ScriptUI の基本的な使い方

### **中級（実践的スキル）**
1. Illustrator Scripting Guide でオブジェクト操作を学習
2. File 操作でファイル読み書きをマスター
3. 簡単なダイアログ作成

### **上級（高度な機能）**
1. VS Code デバッガーでのデバッグ手法
2. コードプロファイリングによる最適化
3. アプリケーション間連携

---

## 🔧 **VS Code 設定でクイックアクセス**

### **設定追加（settings.json）**
```json
{
  "html.suggest.html5": true,
  "bookmarks.saveBookmarksInProject": true,
  "bookmarks.bookmarks": [
    {
      "label": "Adobe ExtendScript Guide",
      "path": "https://extendscript.docsforadobe.dev/"
    },
    {
      "label": "ScriptUI Reference",
      "path": "https://extendscript.docsforadobe.dev/user-interface-tools/"
    },
    {
      "label": "File System Access",
      "path": "https://extendscript.docsforadobe.dev/file-system-access/"
    }
  ]
}
```

### **カスタムキーバインド（keybindings.json）**
```json
[
  {
    "key": "ctrl+shift+r",
    "command": "workbench.action.openRecent",
    "when": "editorTextFocus"
  }
]
```

---

## 🎯 **実際の開発で重要なポイント**

### **必須チェック項目**
- [ ] ExtendScript 環境設定済み
- [ ] VS Code 拡張機能インストール済み
- [ ] デバッガー設定完了
- [ ] Illustrator との連携確認済み

### **頻繁に参照するリファレンス**
1. **ScriptUI コントロール一覧**
2. **Illustrator オブジェクトモデル**
3. **ファイル操作メソッド**
4. **エラーコード一覧**

### **トラブルシューティング**
- デバッガーが動かない → VS Code 拡張設定確認
- スクリプトエラー → ExtendScript Toolkit で検証
- UI が表示されない → ScriptUI 構文チェック

---

**このリファレンス集により、Adobe JSX 開発時にいつでも適切なドキュメントにアクセス可能 ♡**