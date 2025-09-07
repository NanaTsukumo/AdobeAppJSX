# Contributing to AdobeAppJSX

AdobeAppJSXへの貢献をご検討いただき、ありがとうございます！🎉

このプロジェクトは、Adobe ExtendScriptコミュニティの発展と、AI協働開発の実践を目的としています。
皆様の貢献により、より良いツールを作り上げていきましょう。

## 🤝 貢献方法

### Issue報告
- **バグ報告**: 動作しない機能や予期しない挙動について
- **機能要望**: 新しい機能や改善提案
- **質問・サポート**: 使用方法や設定に関する質問

### Pull Request
- **バグ修正**: 既知の問題を解決するコード
- **機能追加**: 新しいスクリプトや機能の実装
- **ドキュメント改善**: README、コメント、技術文書の改善

## 📋 開発ガイドライン

### 前提条件
- Adobe Creative Cloud (Illustrator CC 2020+)
- Visual Studio Code + ExtendScript Debugger
- Git の基本的な使用方法
- JavaScript/ExtendScript の基礎知識

### 開発環境セットアップ
1. **リポジトリをフォーク**
   ```bash
   # あなたのGitHubアカウントでフォーク後
   git clone https://github.com/YOUR_USERNAME/AdobeAppJSX.git
   cd AdobeAppJSX
   ```

2. **ワークスペースを開く**
   ```bash
   code adobe-jsx-workspace.code-workspace
   ```

3. **ブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   # または
   git checkout -b fix/bug-description
   ```

### コーディング規約

#### ExtendScript (.jsx)
```javascript
/**
 * 関数説明
 * @param {string} paramName - パラメータの説明
 * @returns {boolean} 戻り値の説明
 */
function functionName(paramName) {
    // 日本語コメントOK
    // インデント: 4スペース
    if (paramName) {
        return true;
    }
    return false;
}
```

#### ファイル命名規則
- スクリプトファイル: `kebab-case.jsx`
- ドキュメントファイル: `UPPERCASE.md` (README, CHANGELOG等)
- 設定ファイル: `lowercase.json`

#### コミットメッセージ
```
種類(スコープ): 説明

例:
feat(illustrator): Add batch processing functionality
fix(ui): Fix dialog layout on macOS
docs(readme): Update installation instructions
```

**種類**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加
- `chore`: その他（ビルド、設定等）

## 🧪 テスト・品質保証

### 動作テスト
1. **基本動作確認**
   - スクリプトが正常に実行される
   - エラーハンドリングが適切に動作する
   - UI が期待通りに表示される

2. **環境テスト**
   - Windows/macOS での動作
   - 異なるAdobe CCバージョンでの動作
   - 大量データでのパフォーマンス

3. **実用性テスト**
   - 実際の業務フローでの使用
   - 初心者でも使いやすいか
   - エラー時の対応が適切か

### コードレビュー観点
- **安全性**: undo機能、エラーハンドリング
- **パフォーマンス**: 大量処理での効率性
- **ユーザビリティ**: 直感的なUI、分かりやすいメッセージ
- **保守性**: コードの可読性、モジュール化

## 🤖 AI協働開発の実践

このプロジェクトでは、AI技術を積極的に活用した開発を推奨しています。

### 推奨AIツール
- **GitHub Copilot**: コード補完・生成
- **ChatGPT/Claude**: 設計・問題解決
- **Cursor**: リアルタイムコード支援

### AI使用時のガイドライン
1. **透明性**: AIを使用した箇所はコメントで明記
2. **検証**: AI生成コードは必ず動作確認
3. **学習**: AIとの対話プロセスを記録・共有
4. **品質**: 最終的な品質は人間が責任を持つ

### AI協働の記録例
```javascript
// GitHub Copilotによる座標計算ロジック生成
// 人間による検証・最適化済み
function calculateLayout(rows, cols, spacing) {
    // ... 実装
}
```

## 📝 Pull Request プロセス

### 提出前チェックリスト
- [ ] コードが正常に動作することを確認
- [ ] 既存テストが通ることを確認
- [ ] 新機能にはテストを追加
- [ ] ドキュメントを更新（必要に応じて）
- [ ] コミットメッセージが規約に従っている

### PR説明テンプレート
```markdown
## 変更内容
- 何を変更したか
- なぜ変更したか

## テスト
- どのようにテストしたか
- テスト環境・条件

## 関連Issue
- Fixes #123
- Related to #456

## AI使用状況
- 使用したAIツール
- AI協働で解決した問題
```

### レビュープロセス
1. **自動チェック**: linter、基本テスト
2. **人間レビュー**: コード品質、設計の妥当性
3. **動作確認**: 実際の環境での動作テスト
4. **マージ**: 問題なければメインブランチにマージ

## 🌟 Recognition

### 貢献者への感謝
- README に貢献者リストを掲載
- リリースノートで貢献内容を紹介
- GitHub Sponsors での支援受付

### コミュニティ
- 技術的な議論や質問は Issue で
- リアルタイム相談は Discussion で
- 定期的なコミュニティイベント開催予定

## 📞 サポート・質問

### 連絡方法
- **GitHub Issues**: バグ報告・機能要望
- **GitHub Discussions**: 技術相談・雑談
- **Email**: セキュリティ関連の機密事項

### よくある質問
**Q: ExtendScript初心者でも貢献できますか？**
A: もちろんです！ドキュメント改善や使用感のフィードバックも大切な貢献です。

**Q: AIツールを使わずに開発しても良いですか？**
A: はい。AI使用は推奨ですが必須ではありません。

**Q: 商用プロジェクトで使用したいのですが？**
A: Apache 2.0ライセンスにより、商用利用も可能です。

---

**一緒に素晴らしいツールを作り上げましょう！** 🚀

*Created with ❤️ by AI-Human Collaboration*
