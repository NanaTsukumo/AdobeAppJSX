# AdobeAppJSX

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Version](https://img.shields.io/badge/Version-0.1.0--alpha.1-orange.svg)
![ExtendScript](https://img.shields.io/badge/ExtendScript-Adobe%20CC-orange.svg)
![AI-Powered](https://img.shields.io/badge/Development-AI%20Powered-green.svg)
![Status](https://img.shields.io/badge/Status-Alpha-red.svg)

> ⚠️ **ALPHA VERSION**: 現在開発中の実験的プロジェクトです。破壊的変更が発生する可能性があります。

Adobe Creative Suite向けの実用的なExtendScriptコレクション。コミュニティ貢献を目的とした、AI協働開発によるオープンソースプロジェクトです。

## 🎯 プロジェクトの目的

- **コミュニティ貢献**: Adobe Creative Cloud 全体のユーザーの作業効率化を支援
- **実用性重視**: 実際の業務で使える高品質なスクリプトの提供
- **AI協働開発**: 最新のAI技術を活用した効率的な開発プロセスの実践
- **知識共有**: ExtendScript/UXP開発のベストプラクティスとノウハウの蓄積
- **統合プラットフォーム**: Creative Suite横断の自動化ソリューション構築

## 📁 収録スクリプト

### Illustrator Scripts

- **`自動面付け.jsx`** - 面付け自動化スクリプト **[ALPHA]**
  - 複数行列での自動レイアウト
  - プログレスバー付きの安全な処理
  - 印刷業界標準のトンボ自動生成
  - 詳細なエラーハンドリング
  - ⚠️ **Alpha版**: 大量データ・複雑レイアウトで要検証

> **今後の追加予定**: Photoshop、InDesign向けスクリプトも順次追加予定

## 🚀 特徴

### 実用性と安全性

- **undo機能対応**: 安心して試せる設計
- **バリデーション機能**: 入力チェックとエラー防止
- **日本語UI**: 直感的で分かりやすいインターフェース
- **設定保存/復元**: 作業効率を考慮した機能設計

### 技術的特徴

- **モジュール化設計**: 保守性とカスタマイズ性を重視
- **パフォーマンス最適化**: 大量処理にも対応
- **業界標準準拠**: 印刷・デザイン業界の実務要件を満たす

## 🛠️ 開発環境

### 推奨環境

- **Visual Studio Code** + ExtendScript Debugger
- **Adobe Creative Cloud** (Illustrator, Photoshop, InDesign)
- **Git** (バージョン管理)

### 実行方法

1. VS Codeでワークスペースを開く
2. ExtendScript Debuggerをインストール
3. スクリプトファイルを開き、F5でデバッグ実行
4. または、Adobe CC内で「ファイル」→「スクリプト」→「その他のスクリプト」から実行

## 🤖 AI協働開発について

このプロジェクトは、複数のAI技術を活用した協働開発プロセスで構築されています：

### 活用AI技術

- **GitHub Copilot**: コード補完・スニペット生成
- **ChatGPT**: アーキテクチャ設計・問題解決
- **Claude**: コードレビュー・最適化提案
- **Google Gemini**: 技術仕様書作成・ドキュメント整備
- **Perplexity**: 最新技術情報・ベストプラクティス調査
- **Cursor**: リアルタイムコード支援

### AI協働の利点

- **開発速度向上**: 反復作業の自動化
- **品質向上**: 多角的なレビューとテスト
- **知識蓄積**: AIとの対話による学習効果
- **イノベーション**: 人間の創造性とAIの計算能力の融合

## 🔮 将来展望

### 技術ロードマップ

- **UXP (Unified Extensibility Platform) 対応**
  - モダンなWeb技術スタックの採用
  - より柔軟なUI/UX設計
  - クロスアプリケーション対応

### Creative Suite全体への拡張計画

#### グラフィック・デザイン系
- **Photoshop用スクリプト** *(2025年Q4)*
  - バッチ処理自動化・レイヤー管理ツール・色調整自動化
  - RAW画像処理・透かし追加・リサイズ最適化
- **InDesign用スクリプト** *(2026年Q1)*
  - 組版自動化・データ結合最適化・出力前チェック機能
  - 目次生成・相互参照管理・マスターページ最適化

#### 動画・アニメーション系
- **Premiere Pro用スクリプト** *(2026年Q2)*
  - タイムライン自動化・マーカー管理・エクスポート最適化
  - カラーコレクション適用・字幕生成・プロキシ管理
- **After Effects用スクリプト** *(2026年Q2)*
  - コンポジション管理・エフェクト適用・レンダリング自動化
  - キーフレーム最適化・プリコンポーズ管理・プロジェクト整理
- **Animate用スクリプト** *(2026年Q3)*
  - アニメーション最適化・シンボル管理・パブリッシュ自動化
  - ボーン設定・トゥイーン最適化・HTML5キャンバス出力

#### オーディオ・その他
- **Audition用スクリプト** *(2026年Q4)*
  - オーディオ処理・ノイズ除去・バッチ書き出し
  - ポッドキャスト編集・多チャンネル処理・スペクトラム解析
- **Character Animator用スクリプト** *(2027年Q1)*
  - パペット管理・ライブ配信最適化・表情認識調整
- **Dimension用スクリプト** *(2027年Q2)*
  - 3Dモデル配置・ライティング設定・レンダリング最適化

## 📖 ドキュメント

- **技術仕様書**: `SystemPrompts/Adobe/` 配下
- **開発ガイドライン**: `SystemPrompts/README.md`
- **AI協働プロセス**: `.github/copilot-instructions.md`

## 🤝 コントリビューション

### 貢献歓迎

- バグレポート・機能要望
- コードの改善提案
- 新しいスクリプトの追加
- ドキュメントの改善

### 開発参加方法

1. Issueでの議論・提案
2. Pull Requestでのコード貢献
3. AIツールを活用した協働開発

## 📄 ライセンス

MIT License - 商用・非商用問わず自由にご利用ください。

詳細は [LICENSE](LICENSE) ファイルをご確認ください。

## 📋 動作要件

### 必須環境
- **Adobe Creative Cloud**: 2020年版以降（推奨: 2024年版）
- **OS**: Windows 10/11 または macOS 10.15以降
- **Visual Studio Code**: 最新版推奨
- **ExtendScript Debugger**: VS Code拡張機能

### 対応アプリケーション

#### 現在対応済み
- Adobe Illustrator CC 2020+ ✅

#### 開発予定 (2025-2026)
- **Adobe Photoshop CC 2020+** *(2025年Q4予定)*
  - バッチ処理自動化・レイヤー管理・色調整自動化
- **Adobe InDesign CC 2020+** *(2026年Q1予定)*
  - 組版自動化・データ結合最適化・出力前チェック機能
- **Adobe Premiere Pro CC 2020+** *(2026年Q2予定)*
  - タイムライン自動化・マーカー管理・エクスポート最適化
- **Adobe After Effects CC 2020+** *(2026年Q2予定)*
  - コンポジション管理・エフェクト適用・レンダリング自動化
- **Adobe Animate CC 2020+** *(2026年Q3予定)*
  - アニメーション最適化・シンボル管理・パブリッシュ自動化
- **Adobe Audition CC 2020+** *(2026年Q4予定)*
  - オーディオ処理・ノイズ除去・バッチ書き出し

#### 将来的な対応検討
- **Adobe XD** (UXP移行対応・プロトタイプ自動化)
- **Adobe Dimension** (3D自動化・レンダリング最適化)
- **Adobe Character Animator** (アニメーション自動化)
- **Adobe Media Encoder** (バッチ処理連携・フォーマット変換)

## 🛠️ セットアップガイド

### 1. リポジトリのクローン
```bash
git clone https://github.com/NanaTsukumo/AdobeAppJSX.git
cd AdobeAppJSX
```

### 2. VS Code設定
1. VS Codeで `adobe-jsx-workspace.code-workspace` を開く
2. 推奨拡張機能のインストール通知が表示されたら「Install」をクリック
3. 「ExtendScript Debugger」拡張機能を有効化

### 3. スクリプト実行
**方法1: VS Codeから実行（開発者向け）**
1. `illustrator Scripts/自動面付け.jsx` を開く
2. `F5` キーでデバッグ実行
3. Illustratorが自動起動し、スクリプトが実行されます

**方法2: Illustratorから直接実行（エンドユーザー向け）**
1. Illustratorを起動
2. `ファイル` → `スクリプト` → `その他のスクリプト...`
3. `自動面付け.jsx` ファイルを選択して実行

### 4. トラブルシューティング
- **スクリプトが実行されない**: Illustratorでスクリプト実行が有効になっているか確認
- **デバッガが接続できない**: Illustratorを再起動してから再試行
- **権限エラー**: VS Codeを管理者権限で実行してみてください

## 📄 ライセンス

Apache License 2.0 - 商用・非商用問わず自由にご利用ください。

## 🙏 謝辞

このプロジェクトは、Adobe ExtendScriptコミュニティの皆様、そして先進的なAI技術の恩恵を受けて開発されています。

特に、実際の業務現場での課題解決を通じて得られた知見を基に、実用性の高いツール開発を目指しています。

---

Created with ❤️ by AI-Human Collaboration
