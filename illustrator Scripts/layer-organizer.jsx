// ========================================
// ファイル: layer-organizer.jsx
// 目的: Illustratorレイヤー構造の自動整理・最適化
// 対応: Adobe Illustrator CC 2020以降
// 参照: References/Adobe-JSX-Documentation-Index.md
// 作者: 月代観るな (Luna Tsukuyomi)
// ライセンス: Apache-2.0
// バージョン: 0.1.0-alpha.1
// 作成日: 2025-09-11
// 更新日: 2025-11-01
// ステータス: Alpha - Phase 1実装中
// 
// 要件定義: SystemPrompts/Adobe/layer-organizer-requirements.md
// ========================================

// === グローバル変数とデバッグ設定 ===
// スクリプトのバージョン情報
// alpha.1: 基本的なレイヤー整理機能（空レイヤー削除、自動リネーム）
var SCRIPT_VERSION = "0.1.0-alpha.1";

// デバッグモード設定
// true の場合、ExtendScript Toolkit のコンソールに詳細ログを出力
var DEBUG_MODE = true;

// プログレスウィンドウのインスタンス
// レイヤー整理の進行状況を表示する ScriptUI Window オブジェクト
var PROGRESS_WINDOW = null;

// キャンセルリクエストフラグ
// ユーザーがキャンセルボタンをクリックした際に true に設定される
var CANCEL_REQUESTED = false;

// === レイヤー整理設定 ===
// レイヤー整理処理のすべてのデフォルト設定を管理するグローバル設定オブジェクト
// ユーザーが UI で選択した設定と mergeSettings 関数でマージされる
var ORGANIZER_SETTINGS = {
    // 命名規則設定
    // 各オブジェクトタイプに対する自動生成レイヤー名のテンプレート
    naming: {
        text: "Text_{content}",           // テキストレイヤー: 内容の最初の8文字を使用
        shape: "Shape_{type}_{color}",    // 図形レイヤー: 形状タイプと色情報
        image: "Image_{filename}",        // 画像レイヤー: 元ファイル名を使用
        path: "Path_{points}pt",          // パスレイヤー: ポイント数
        mixed: "Mixed_{main}"             // 混在レイヤー: 主要オブジェクトタイプ
    },
    
    // カテゴリ分類設定
    // Phase 2で実装予定のカテゴリ別フォルダ構造の定義
    categories: {
        text: "Text/",
        shapes: "Shapes/",
        images: "Images/", 
        background: "Background/",
        decorations: "Decorations/"
    },
    
    // 除外設定
    // 整理処理から除外するレイヤーの条件設定
    exclude: {
        locked: false,      // true の場合、ロックされたレイヤーを除外
        hidden: false,      // true の場合、非表示レイヤーを除外
        pattern: ""         // 正規表現パターンにマッチするレイヤー名を除外
    },
    
    // 整理オプション
    // 各整理処理の有効/無効を制御するフラグ
    options: {
        removeEmpty: true,   // 空レイヤーを削除
        autoRename: true,    // レイヤー名を自動リネーム
        categorize: false,   // カテゴリ別に分類（Phase 2予定）
        colorGroup: false,   // 色で自動グルーピング（Phase 2予定）
        sizeSort: false      // サイズでソート（Phase 2予定）
    }
};

/**
 * メイン実行関数
 * 
 * レイヤー整理処理の開始点。
 * 環境チェック、UI表示、設定取得、実行確認を経て実際の整理処理を呼び出す。
 * すべての処理は try-catch でラップされ、エラー時は handleError 関数でユーザーに通知。
 * 
 * @returns {void}
 */
function main() {
    try {
        debugLog("=== AI レイヤー整理ツール 開始 ===");
        
        // 環境チェック
        // ドキュメントの存在、レイヤーの存在、編集可能状態を検証
        if (!validateEnvironment()) {
            return;
        }
        
        // UI表示・設定取得
        // ScriptUI ダイアログを表示してユーザーから整理設定を取得
        var userSettings = showMainDialog();
        if (!userSettings) {
            debugLog("ユーザーによりキャンセルされました");
            return;
        }
        
        // 設定をマージ
        // ユーザー設定をグローバル設定オブジェクトにマージ
        mergeSettings(userSettings);
        
        // 実行確認
        // 処理内容をユーザーに確認して実行許可を得る
        if (!showConfirmDialog()) {
            return;
        }
        
        // レイヤー整理実行
        // 実際の整理処理を実行（プログレスバー表示付き）
        executeLayerOrganization();
        
        debugLog("=== レイヤー整理完了 ===");
        
    } catch (error) {
        handleError("メイン処理でエラーが発生しました", error);
    }
}

/**
 * 環境・前提条件の検証
 * 
 * スクリプト実行前に必要な条件をチェック。
 * ドキュメントの存在、レイヤーの存在、編集可能状態を確認し、
 * 条件を満たさない場合はユーザーにアラート表示して false を返す。
 * 
 * @returns {Boolean} 環境チェック成功時は true、失敗時は false
 */
function validateEnvironment() {
    debugLog("環境チェック開始...");
    
    // ドキュメントの存在確認
    // app.documents.length で開いているドキュメント数を取得
    if (!app.documents.length) {
        alert("エラー: ドキュメントが開かれていません。\\n" +
              "Illustratorでドキュメントを開いてから再実行してください。");
        return false;
    }
    
    // アクティブドキュメントの取得
    var doc = app.activeDocument;
    
    // レイヤーの存在確認
    // layers.length でドキュメント内のレイヤー数を確認
    if (!doc.layers.length) {
        alert("エラー: ドキュメントにレイヤーが存在しません。");
        return false;
    }
    
    // 編集可能状態確認
    // すべてのレイヤーがロックされている場合は警告
    if (doc.layers.length === 1 && doc.layers[0].locked) {
        alert("警告: すべてのレイヤーがロックされています。\\n" +
              "レイヤーのロックを解除してから実行してください。");
        return false;
    }
    
    debugLog("環境チェック完了 - OK");
    return true;
}

/**
 * メインダイアログの表示
 * 
 * ScriptUI を使用してレイヤー整理の設定ダイアログを表示。
 * プリセット選択、整理オプション、除外設定、プレビュー・実行ボタンを含む。
 * ユーザーが「実行」ボタンをクリックした場合は設定オブジェクトを返し、
 * 「キャンセル」をクリックした場合は null を返す。
 * 
 * @returns {Object|null} ユーザー設定オブジェクト、またはキャンセル時は null
 */
function showMainDialog() {
    debugLog("メインダイアログ表示...");
    
    // ScriptUI Window オブジェクトの作成
    // "dialog" タイプは modal ダイアログとして動作し、show() で表示される
    var dialog = new Window("dialog", "AI レイヤー整理ツール v" + SCRIPT_VERSION);
    dialog.orientation = "column";
    dialog.alignChildren = "left";
    dialog.spacing = 15;
    dialog.margins = 20;
    
    // === プリセット選択グループ ===
    // radiobutton でプリセット選択を提供（デフォルト、印刷用、Web用、カスタム）
    var presetGroup = dialog.add("panel", undefined, "整理プリセット");
    presetGroup.orientation = "column";
    presetGroup.alignChildren = "left";
    presetGroup.spacing = 8;
    presetGroup.margins = 15;
    
    var preset1 = presetGroup.add("radiobutton", undefined, "デフォルト整理（推奨）");
    var preset2 = presetGroup.add("radiobutton", undefined, "印刷用最適化");
    var preset3 = presetGroup.add("radiobutton", undefined, "Web用最適化");
    var preset4 = presetGroup.add("radiobutton", undefined, "カスタム設定");
    
    // デフォルト選択
    preset1.value = true;
    
    // === 整理オプショングループ ===
    // checkbox で各整理機能の有効/無効を設定
    var optionGroup = dialog.add("panel", undefined, "整理オプション");
    optionGroup.orientation = "column";
    optionGroup.alignChildren = "left";
    optionGroup.spacing = 8;
    optionGroup.margins = 15;
    
    var opt1 = optionGroup.add("checkbox", undefined, "空レイヤーを削除");
    var opt2 = optionGroup.add("checkbox", undefined, "レイヤー名を自動リネーム");
    var opt3 = optionGroup.add("checkbox", undefined, "カテゴリ別に分類");
    var opt4 = optionGroup.add("checkbox", undefined, "色で自動グルーピング");
    var opt5 = optionGroup.add("checkbox", undefined, "サイズでソート");
    
    // デフォルト値設定
    // ORGANIZER_SETTINGS のグローバル設定をチェックボックスの初期値として適用
    opt1.value = ORGANIZER_SETTINGS.options.removeEmpty;
    opt2.value = ORGANIZER_SETTINGS.options.autoRename;
    opt3.value = ORGANIZER_SETTINGS.options.categorize;
    opt4.value = ORGANIZER_SETTINGS.options.colorGroup;
    opt5.value = ORGANIZER_SETTINGS.options.sizeSort;
    
    // === 除外設定グループ ===
    var excludeGroup = dialog.add("panel", undefined, "除外設定");
    excludeGroup.orientation = "column";
    excludeGroup.alignChildren = "left";
    excludeGroup.spacing = 8;
    excludeGroup.margins = 15;
    
    var exc1 = excludeGroup.add("checkbox", undefined, "ロックレイヤーを除外");
    var exc2 = excludeGroup.add("checkbox", undefined, "非表示レイヤーを除外");
    var patternGroup = excludeGroup.add("group");
    patternGroup.add("statictext", undefined, "名前除外パターン(正規表現):");
    var excPattern = patternGroup.add("edittext", undefined, ORGANIZER_SETTINGS.exclude.pattern);
    excPattern.characters = 24;
    
    exc1.value = ORGANIZER_SETTINGS.exclude.locked;
    exc2.value = ORGANIZER_SETTINGS.exclude.hidden;
    
    // === プレビュー・操作ボタン ===
    var buttonGroup = dialog.add("group");
    buttonGroup.orientation = "row";
    buttonGroup.spacing = 10;
    
    var previewBtn = buttonGroup.add("button", undefined, "プレビュー");
    var saveBtn = buttonGroup.add("button", undefined, "設定保存");
    
    var actionGroup = dialog.add("group");
    actionGroup.orientation = "row";
    actionGroup.spacing = 10;
    
    var executeBtn = actionGroup.add("button", undefined, "実行", {name: "ok"});
    var cancelBtn = actionGroup.add("button", undefined, "キャンセル", {name: "cancel"});
    var helpBtn = actionGroup.add("button", undefined, "ヘルプ");
    
    // === イベントハンドラー ===
    previewBtn.onClick = function() {
        showPreviewDialog(getCurrentSettings());
    };
    
    saveBtn.onClick = function() {
        saveUserSettings(getCurrentSettings());
        alert("設定を保存しました。");
    };
    
    helpBtn.onClick = function() {
        showHelpDialog();
    };
    
    /**
     * 現在のダイアログ設定を取得
     */
    function getCurrentSettings() {
        return {
            preset: preset1.value ? "default" : 
                   preset2.value ? "print" :
                   preset3.value ? "web" : "custom",
            options: {
                removeEmpty: opt1.value,
                autoRename: opt2.value,
                categorize: opt3.value,
                colorGroup: opt4.value,
                sizeSort: opt5.value
            },
            exclude: {
                locked: exc1.value,
                hidden: exc2.value,
                pattern: excPattern.text
            }
        };
    }
    
    // ダイアログ表示
    var result = dialog.show();
    
    if (result === 1) {
        debugLog("ユーザー設定取得完了");
        return getCurrentSettings();
    } else {
        return null;
    }
}

/**
 * 確認ダイアログの表示
 * 
 * レイヤー整理実行前にユーザーへ最終確認を行う。
 * 対象レイヤー数と処理内容を表示し、ドキュメント保存を推奨するメッセージを含む。
 * 
 * @returns {Boolean} ユーザーが「はい」をクリックした場合 true、「いいえ」の場合 false
 */
function showConfirmDialog() {
    var doc = app.activeDocument;
    var layerCount = doc.layers.length;
    
    // 確認メッセージの構築
    // layers.length でレイヤー数を取得し、処理内容をユーザーに伝える
    var message = "レイヤー整理を実行します。\\n\\n" +
                  "対象レイヤー数: " + layerCount + "個\\n" +
                  "処理内容: 命名、整理、最適化\\n\\n" +
                  "※実行前にドキュメントを保存することをお勧めします。\\n\\n" +
                  "続行しますか？";
    
    return confirm(message);
}

/**
 * レイヤー整理のメイン実行処理
 * 
 * suspendHistory を使用して undo 可能な形でレイヤー整理を実行。
 * プログレスバーを表示し、選択されたオプションに応じて処理ステップ数を計算。
 * 実際の整理処理は performOrganization 関数で実行され、undo グループ内に含まれる。
 * 
 * @returns {void}
 */
function executeLayerOrganization() {
    debugLog("レイヤー整理実行開始...");
    
    var doc = app.activeDocument;
    
    // プログレスバー表示（選択されたフェーズ数を最大値に設定）
    // 各オプションが有効な場合にステップ数をカウントし、プログレスバーの最大値を設定
    var totalSteps = 0;
    if (ORGANIZER_SETTINGS.options.removeEmpty) totalSteps++;
    if (ORGANIZER_SETTINGS.options.autoRename) totalSteps++;
    if (ORGANIZER_SETTINGS.options.categorize) totalSteps++;
    if (ORGANIZER_SETTINGS.options.colorGroup) totalSteps++;
    if (ORGANIZER_SETTINGS.options.sizeSort) totalSteps++;
    if (totalSteps === 0) totalSteps = 1;
    showProgressWindow("レイヤー整理中...", totalSteps);
    
    try {
        // undo機能のためのhistory開始
        // suspendHistory により、処理全体を1つの undo 単位としてグループ化
        // ユーザーは Ctrl+Z で処理全体を一括で元に戻すことができる
        app.activeDocument.suspendHistory("AI レイヤー整理", "performOrganization()");
        
    } catch (error) {
        handleError("レイヤー整理実行中にエラーが発生しました", error);
    } finally {
        // プログレスバー閉じる
        closeProgressWindow();
    }
}

/**
 * 実際の整理処理（undoグループ内で実行）
 */
function performOrganization() {
    var doc = app.activeDocument;
    var processedCount = 0;
    var stats = {
        renamed: 0,
        removed: 0,
        categorized: 0,
        errors: 0,
        cancelled: false
    };
    
    debugLog("整理処理開始 - 対象レイヤー数: " + doc.layers.length);
    
    // Phase 1: 空レイヤー除去
    if (ORGANIZER_SETTINGS.options.removeEmpty) {
        if (CANCEL_REQUESTED) { stats.cancelled = true; return; }
        stats.removed = removeEmptyLayers(stats);
        updateProgress(++processedCount, "空レイヤー除去完了...");
    }
    
    // Phase 2: レイヤー名自動リネーム
    if (ORGANIZER_SETTINGS.options.autoRename) {
        if (CANCEL_REQUESTED) { stats.cancelled = true; return; }
        stats.renamed = renameLayersAutomatically(stats);
        updateProgress(++processedCount, "レイヤー名変更完了...");
    }
    
    // Phase 3: カテゴリ別分類（将来実装）
    if (ORGANIZER_SETTINGS.options.categorize) {
        // TODO: Phase 2で実装予定
        updateProgress(++processedCount, "カテゴリ分類（未実装）...");
    }
    
    debugLog("整理処理完了");
    
    // 結果レポート表示
    showResultDialog(stats);
}

/**
 * 空レイヤーの除去
 * 
 * pageItems.length === 0 のレイヤーを検出して削除する。
 * 削除前にユーザーへ確認ダイアログを表示し、対象レイヤー名のプレビューリストを提供。
 * 除外設定（ロック、非表示、パターンマッチ）に基づいてレイヤーをフィルタリング。
 * 
 * @param {Object} stats - 統計情報オブジェクト（エラーカウントなど）
 * @returns {Number} 削除されたレイヤーの数
 */
function removeEmptyLayers(stats) {
    debugLog("空レイヤー除去開始...");
    
    var doc = app.activeDocument;
    var removedCount = 0;
    var layersToRemove = [];
    
    // 削除対象レイヤーを特定（逆順でチェック）
    // 逆順ループで配列インデックスの変動を防ぐ
    for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        
        // 除外条件チェック
        // shouldExcludeLayer 関数で除外設定に基づいて判定
        if (shouldExcludeLayer(layer)) {
            continue;
        }
        
        // 空レイヤー判定
        // isEmptyLayer 関数で pageItems.length をチェック
        if (isEmptyLayer(layer)) {
            layersToRemove.push(layer.name);
        }
    }
    
    // 削除前確認
    // 対象レイヤー名のリストを表示してユーザーに確認を求める
    if (layersToRemove.length > 0) {
        var previewList = layersToRemove.slice(0, 15).join("\n");
        var more = layersToRemove.length > 15 ? "\n... 他 " + (layersToRemove.length - 15) + " 件" : "";
        var confirmMsg = "空レイヤーを削除します。\n\n対象: " + layersToRemove.length + " 件\n\n" + previewList + more + "\n\n続行しますか？";
        if (!confirm(confirmMsg)) {
            debugLog("空レイヤー削除はユーザーによりキャンセルされました");
            return 0;
        }
    }

    // 実際の削除実行
    // layers.getByName でレイヤーを取得して remove() で削除
    for (var j = layersToRemove.length - 1; j >= 0; j--) {
        if (CANCEL_REQUESTED) { break; }
        try {
            var layerToRemove = doc.layers.getByName(layersToRemove[j]);
            layerToRemove.remove();
            removedCount++;
            debugLog("空レイヤー削除: " + layersToRemove[j]);
        } catch (error) {
            if (stats) stats.errors++;
            debugLog("レイヤー削除エラー: " + layersToRemove[j] + " - " + error.message);
        }
    }
    
    debugLog("空レイヤー除去完了 - 削除数: " + removedCount);
    return removedCount;
}

/**
 * レイヤーの自動リネーム
 * 
 * レイヤー内のオブジェクトタイプを判定して、適切な命名規則に従ってリネーム。
 * テキストレイヤー、図形レイヤー、画像レイヤーなどの主要タイプを自動判定し、
 * generateLayerName 関数で新しいレイヤー名を生成して適用する。
 * 
 * @param {Object} stats - 統計情報オブジェクト（エラーカウントなど）
 * @returns {Number} 名前変更されたレイヤーの数
 */
function renameLayersAutomatically(stats) {
    debugLog("レイヤー自動リネーム開始...");
    
    var doc = app.activeDocument;
    var renamedCount = 0;
    
    // 全レイヤーをループして処理
    for (var i = 0; i < doc.layers.length; i++) {
        if (CANCEL_REQUESTED) { break; }
        var layer = doc.layers[i];
        
        // 除外条件チェック
        if (shouldExcludeLayer(layer)) {
            continue;
        }
        
        try {
            // generateLayerName でオブジェクトタイプに応じた新しい名前を生成
            var newName = generateLayerName(layer);
            if (newName && newName !== layer.name) {
                var oldName = layer.name;
                layer.name = newName;
                renamedCount++;
                debugLog("レイヤー名変更: " + oldName + " → " + newName);
            }
        } catch (error) {
            if (stats) stats.errors++;
            debugLog("レイヤー名変更エラー: " + layer.name + " - " + error.message);
        }
    }
    
    debugLog("レイヤー自動リネーム完了 - 変更数: " + renamedCount);
    return renamedCount;
}

/**
 * レイヤーが除外対象かどうかを判定
 * 
 * ORGANIZER_SETTINGS.exclude の設定に基づいてレイヤーをフィルタリング。
 * ロック状態、表示状態、正規表現パターンマッチの3つの条件をチェック。
 * 
 * @param {Layer} layer - 判定対象の Illustrator Layer オブジェクト
 * @returns {Boolean} 除外対象の場合 true、処理対象の場合 false
 */
function shouldExcludeLayer(layer) {
    // ロックレイヤー除外設定
    // layer.locked プロパティで判定
    if (ORGANIZER_SETTINGS.exclude.locked && layer.locked) {
        return true;
    }
    
    // 非表示レイヤー除外設定
    // layer.visible プロパティで判定
    if (ORGANIZER_SETTINGS.exclude.hidden && !layer.visible) {
        return true;
    }
    
    // 特定パターン除外（正規表現）
    // ユーザーが指定した正規表現パターンに layer.name がマッチする場合除外
    if (ORGANIZER_SETTINGS.exclude.pattern && ORGANIZER_SETTINGS.exclude.pattern.length > 0) {
        try {
            var re = new RegExp(ORGANIZER_SETTINGS.exclude.pattern);
            if (re.test(layer.name)) {
                return true;
            }
        } catch (e) {
            debugLog("除外パターンの正規表現エラー: " + e.message);
        }
    }
    
    return false;
}

/**
 * 空レイヤーかどうかを判定
 */
function isEmptyLayer(layer) {
    try {
        // サブレイヤーが存在する場合は空ではない
        if (layer.layers && layer.layers.length > 0) {
            return false;
        }
        // pageItemsプロパティでオブジェクト数をチェック
        return layer.pageItems.length === 0;
    } catch (error) {
        debugLog("空レイヤー判定エラー: " + layer.name + " - " + error.message);
        return false;
    }
}

/**
 * レイヤー名の自動生成
 * 
 * determineMainObjectType でオブジェクトタイプを判定後、
 * タイプ別の名前生成関数を呼び出して命名規則を適用。
 * 空レイヤーは null を返して名前変更をスキップ。
 * 
 * @param {Layer} layer - 名前を生成する Illustrator Layer オブジェクト
 * @returns {String|null} 生成された新しいレイヤー名、空レイヤーの場合は null
 */
function generateLayerName(layer) {
    try {
        // pageItems.length で空レイヤーをチェック
        // 空の場合は名前変更しない
        var items = layer.pageItems;
        if (items.length === 0) {
            return null; // 空レイヤーは名前変更しない
        }
        
        // 主要オブジェクトタイプの判定
        // テキスト、シェイプ、画像、パス、混合の5種類に分類
        var mainType = determineMainObjectType(layer);
        var newName = "";
        
        // タイプ別に名前生成関数を呼び出し
        // ORGANIZER_SETTINGS.naming のテンプレートを使用
        switch (mainType) {
            case "text":
                newName = generateTextLayerName(layer);
                break;
            case "shape":
                newName = generateShapeLayerName(layer);
                break;
            case "image":
                newName = generateImageLayerName(layer);
                break;
            case "path":
                newName = generatePathLayerName(layer);
                break;
            default:
                newName = generateMixedLayerName(layer);
        }
        
        return newName;
        
    } catch (error) {
        debugLog("レイヤー名生成エラー: " + layer.name + " - " + error.message);
        return null;
    }
}

/**
 * レイヤーの主要オブジェクトタイプを判定
 * 
 * レイヤー内の全 pageItems を走査してタイプ別にカウント。
 * typename プロパティで判定: TextFrame, PlacedItem/RasterItem, PathItem (filled/stroked)
 * 最も多いタイプを主要タイプとして返す。
 * 
 * @param {Layer} layer - 判定対象の Illustrator Layer オブジェクト
 * @returns {String} "text", "shape", "image", "path", "mixed" のいずれか
 */
function determineMainObjectType(layer) {
    // pageItems の全アイテムを走査
    var items = layer.pageItems;
    var textCount = 0;
    var shapeCount = 0;
    var imageCount = 0;
    var pathCount = 0;
    
    // typename プロパティでオブジェクト種類を判定
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        // TextFrame: テキストオブジェクト
        if (item.typename === "TextFrame") {
            textCount++;
        // PlacedItem/RasterItem: 配置画像・ラスター画像
        } else if (item.typename === "PlacedItem" || item.typename === "RasterItem") {
            imageCount++;
        // PathItem: パスオブジェクト
        } else if (item.typename === "PathItem") {
            // filled または stroked が true の場合はシェイプとして扱う
            if (item.filled || item.stroked) {
                shapeCount++;
            } else {
                pathCount++;
            }
        }
    }
    
    // 最も多いタイプを主要タイプとして返す
    // Math.max で最大値を取得して該当タイプを判定
    var max = Math.max(textCount, shapeCount, imageCount, pathCount);
    if (max === textCount) return "text";
    if (max === shapeCount) return "shape";
    if (max === imageCount) return "image";
    if (max === pathCount) return "path";
    
    return "mixed";
}

/**
 * テキストレイヤー名の生成
 * 
 * レイヤー内の全 TextFrame オブジェクトを抽出。
 * 最初のテキストフレームの contents から先頭8文字を取得して名前に使用。
 * 改行・タブなどの制御文字は除去して読みやすい名前を生成。
 * 
 * @param {Layer} layer - 名前を生成する Illustrator Layer オブジェクト
 * @returns {String} "Text_" + テキスト内容（最大8文字）、空の場合は "Text_Empty"
 */
function generateTextLayerName(layer) {
    try {
        // TextFrame オブジェクトのみを抽出
        // typename === "TextFrame" で判定
        var textFrames = [];
        for (var i = 0; i < layer.pageItems.length; i++) {
            if (layer.pageItems[i].typename === "TextFrame") {
                textFrames.push(layer.pageItems[i]);
            }
        }
        
        // 最初のテキストフレームから contents を取得
        if (textFrames.length > 0) {
            var firstText = textFrames[0].contents;
            // 改行・タブ・特殊文字を除去して先頭8文字を取得
            // replace(/[\r\n\t]/g, "") で制御文字を削除
            var cleanText = firstText.replace(/[\\r\\n\\t]/g, "").substring(0, 8);
            if (cleanText) {
                return "Text_" + cleanText;
            }
        }
        
        return "Text_Empty";
    } catch (error) {
        return "Text_Error";
    }
}

/**
 * 図形レイヤー名の生成
 * 
 * レイヤー内の PathItem (filled または stroked) を走査して図形タイプを判定。
 * pathPoints.length から基本形状を推定: 4点=矩形、8点以上=円形。
 * fillColor から色情報を取得して名前に含める。
 * 
 * @param {Layer} layer - 名前を生成する Illustrator Layer オブジェクト
 * @returns {String} "Shape_" + 形状タイプ + "_" + 色情報、エラー時は "Shape_Error"
 */
function generateShapeLayerName(layer) {
    try {
        // 形状タイプと色情報の初期化
        var shapeType = "Generic";
        var colorInfo = "";
        
        // 最初の図形オブジェクトから情報取得
        // PathItem かつ filled/stroked が true のもの
        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            if (item.typename === "PathItem" && (item.filled || item.stroked)) {
                // pathPoints.length から基本形状を判定
                // 4点=矩形、8点以上=円形、その他=汎用シェイプ
                if (item.pathPoints.length === 4) {
                    shapeType = "Rect";
                } else if (item.pathPoints.length > 8) {
                    shapeType = "Circle";
                } else {
                    shapeType = "Shape";
                }
                
                // fillColor から色情報を取得
                // getColorInfo 関数で色名を取得
                if (item.filled) {
                    colorInfo = getColorInfo(item.fillColor);
                }
                break;
            }
        }
        
        return "Shape_" + shapeType + (colorInfo ? "_" + colorInfo : "");
    } catch (error) {
        return "Shape_Error";
    }
}

/**
 * 画像レイヤー名の生成
 * 
 * レイヤー内の PlacedItem/RasterItem を走査して画像ファイル名を取得。
 * PlacedItem.file から元ファイルパスを取得し、ファイル名のみを抽出。
 * RasterItem の場合は "Raster" として扱う。
 * 
 * @param {Layer} layer - 名前を生成する Illustrator Layer オブジェクト
 * @returns {String} "Image_" + ファイル名（拡張子なし）、エラー時は "Image_Error"
 */
function generateImageLayerName(layer) {
    try {
        // PlacedItem/RasterItem を走査
        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            if (item.typename === "PlacedItem" || item.typename === "RasterItem") {
                // ファイル名を取得（パスから抽出）
                var filename = "Unknown";
                try {
                    // PlacedItem.file から元ファイルパスを取得
                    if (item.typename === "PlacedItem" && item.file) {
                        var filePath = item.file.toString();
                        // "/" で分割して最後の要素（ファイル名）を取得
                        var parts = filePath.split("/");
                        if (parts.length > 0) {
                            // 拡張子を除去
                            filename = parts[parts.length - 1].replace(/\.[^.]+$/, ""); // 拡張子除去
                        }
                    } else if (item.typename === "RasterItem") {
                        filename = "Raster";
                    }
                } catch (e) {
                    // 埋め込み画像の場合
                    filename = "Embedded";
                }
                
                return "Image_" + filename;
            }
        }
        
        return "Image_None";
    } catch (error) {
        return "Image_Error";
    }
}

/**
 * パスレイヤー名の生成
 * 
 * レイヤー内の PathItem (filled/stroked が false) を走査。
 * pathPoints.length を合計して総ポイント数を取得。
 * ポイント数をレイヤー名に含めることでパスの複雑さを表現。
 * 
 * @param {Layer} layer - 名前を生成する Illustrator Layer オブジェクト
 * @returns {String} "Path_" + 総ポイント数 + "pt"、エラー時は "Path_Error"
 */
function generatePathLayerName(layer) {
    try {
        // 総ポイント数とパス数のカウント
        var totalPoints = 0;
        var pathCount = 0;
        
        // PathItem で filled/stroked が false のもの（線なしパス）を走査
        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            if (item.typename === "PathItem" && !item.filled && !item.stroked) {
                // pathPoints.length を合計
                totalPoints += item.pathPoints.length;
                pathCount++;
            }
        }
        
        // ポイント数をレイヤー名に含める
        if (pathCount > 0) {
            return "Path_" + totalPoints + "pt";
        }
        
        return "Path_Empty";
    } catch (error) {
        return "Path_Error";
    }
}

/**
 * 混在レイヤー名の生成
 * 
 * 複数のオブジェクトタイプが混在するレイヤーに対して使用。
 * pageItems.length でレイヤー内の総オブジェクト数を取得し、名前に含める。
 * 
 * @param {Layer} layer - 名前を生成する Illustrator Layer オブジェクト
 * @returns {String} "Mixed_" + オブジェクト数 + "items"、エラー時は "Mixed_Error"
 */
function generateMixedLayerName(layer) {
    try {
        // pageItems.length で総オブジェクト数を取得
        var itemCount = layer.pageItems.length;
        return "Mixed_" + itemCount + "items";
    } catch (error) {
        return "Mixed_Error";
    }
}

/**
 * 色情報の簡略取得
 * 
 * fillColor の typename を判定して色情報を取得。
 * RGBColor の場合は RGB 値から代表色名を推定（White, Black, Red, Green, Blue, Color）。
 * その他の色タイプは "Fill" として返す。
 * 
 * @param {Color} fillColor - Illustrator の Color オブジェクト
 * @returns {String} 色名文字列、判定不可の場合は "Unknown"
 */
function getColorInfo(fillColor) {
    try {
        // RGBColor の場合は RGB 値から色を判定
        if (fillColor.typename === "RGBColor") {
            // red, green, blue プロパティで RGB 値を取得（0-255）
            var r = fillColor.red;
            var g = fillColor.green;
            var b = fillColor.blue;
            
            // RGB 値から代表色を判定
            // 200以上は白系、50未満は黒系
            if (r > 200 && g > 200 && b > 200) return "White";
            if (r < 50 && g < 50 && b < 50) return "Black";
            // 最大値を持つ色成分で判定
            if (r > g && r > b) return "Red";
            if (g > r && g > b) return "Green";
            if (b > r && b > g) return "Blue";
            return "Color";
        }
        // RGBColor 以外（CMYK, Grayscale, Spot など）
        return "Fill";
    } catch (error) {
        return "Unknown";
    }
}

/**
 * 設定のマージ
 * 
 * ユーザー設定を ORGANIZER_SETTINGS にマージ。
 * options と exclude の各プロパティを hasOwnProperty でチェックして安全に上書き。
 * デフォルト値はそのまま保持されるため、部分的な設定変更が可能。
 * 
 * @param {Object} userSettings - ユーザー設定オブジェクト {options, exclude}
 */
function mergeSettings(userSettings) {
    if (userSettings) {
        // options の各プロパティをマージ
        // hasOwnProperty で自身のプロパティのみを対象
        if (userSettings.options) {
            for (var key in userSettings.options) {
                if (userSettings.options.hasOwnProperty(key)) {
                    ORGANIZER_SETTINGS.options[key] = userSettings.options[key];
                }
            }
        }
        
        // exclude の各プロパティをマージ
        if (userSettings.exclude) {
            for (var key in userSettings.exclude) {
                if (userSettings.exclude.hasOwnProperty(key)) {
                    ORGANIZER_SETTINGS.exclude[key] = userSettings.exclude[key];
                }
            }
        }
    }
}

/**
 * プログレスウィンドウ表示
 * 
 * 処理中の進捗を表示する ScriptUI Window を作成。
 * progressbar で進捗をビジュアル表示し、キャンセルボタンでユーザーが処理を中断可能。
 * CANCEL_REQUESTED フラグを使用して中断要求を管理。
 * 
 * @param {String} message - 表示するメッセージ
 * @param {Number} maxValue - プログレスバーの最大値
 */
function showProgressWindow(message, maxValue) {
    // キャンセルフラグをリセット
    CANCEL_REQUESTED = false;
    
    // ScriptUI Window を "window" タイプで作成（モーダルではない）
    PROGRESS_WINDOW = new Window("window", "処理中...");
    PROGRESS_WINDOW.orientation = "column";
    PROGRESS_WINDOW.alignChildren = "fill";
    PROGRESS_WINDOW.margins = 12;
    
    // メッセージテキスト追加
    PROGRESS_WINDOW.messageText = PROGRESS_WINDOW.add("statictext", undefined, message);
    
    // プログレスバー追加
    // progressbar(undefined, min, max) で範囲を指定
    PROGRESS_WINDOW.progressBar = PROGRESS_WINDOW.add("progressbar", undefined, 0, maxValue);
    PROGRESS_WINDOW.progressBar.preferredSize.width = 320;
    
    // キャンセルボタン追加
    var g = PROGRESS_WINDOW.add("group");
    g.alignment = "right";
    var cancelBtn = g.add("button", undefined, "キャンセル");
    cancelBtn.onClick = function() {
        // キャンセル要求フラグを立てる
        CANCEL_REQUESTED = true;
        PROGRESS_WINDOW.text = "キャンセル要求中...";
    };
    
    // ウィンドウ表示（非モーダル）
    PROGRESS_WINDOW.show();
}

/**
 * プログレス更新
 * 
 * プログレスウィンドウの progressbar.value を更新。
 * オプションでメッセージテキストも変更可能。
 * 
 * @param {Number} value - 現在の進捗値
 * @param {String} message - 表示するメッセージ（省略可）
 */
function updateProgress(value, message) {
    // プログレスウィンドウと progressbar の存在確認
    if (PROGRESS_WINDOW && PROGRESS_WINDOW.progressBar) {
        // progressbar.value を更新
        PROGRESS_WINDOW.progressBar.value = value;
        
        // メッセージが指定されている場合は更新
        if (message) {
            if (PROGRESS_WINDOW.messageText) {
                PROGRESS_WINDOW.messageText.text = message;
            } else {
                PROGRESS_WINDOW.text = message;
            }
        }
    }
}

/**
 * プログレスウィンドウを閉じて解放
 * 
 * PROGRESS_WINDOW の close() メソッドを呼び出してウィンドウを閉じる。
 * その後、null を代入することでメモリを解放し、ガベージコレクションの対象とする。
 * この処理により、プログレスウィンドウが正常終了・エラー終了のどちらでも
 * 適切にクリーンアップされることを保証する。
 */
function closeProgressWindow() {
    // PROGRESS_WINDOW が存在する場合のみクローズ処理実行
    // 二重クローズを防ぐための null チェック
    if (PROGRESS_WINDOW) {
        // ScriptUI Window の close() メソッドでウィンドウを閉じる
        PROGRESS_WINDOW.close();
        
        // null 代入でガベージコレクション対象とし、メモリを解放
        PROGRESS_WINDOW = null;
    }
}

/**
 * 処理結果レポートダイアログを表示
 * 
 * レイヤー整理処理の完了後、処理統計をユーザーに通知する。
 * stats オブジェクトから renamed/removed/categorized/errors の
 * 各カウント値を取得し、整形されたメッセージとして alert 表示する。
 * cancelled フラグが true の場合は中断メッセージを表示。
 * 
 * @param {Object} stats - 処理統計オブジェクト {renamed, removed, categorized, errors, cancelled}
 */
function showResultDialog(stats) {
    // stats.cancelled で中断・完了を判定してタイトル設定
    var title = (stats && stats.cancelled) ? "レイヤー整理はキャンセルされました" : "レイヤー整理が完了しました！";
    
    // 処理結果の統計を整形
    // renamed/removed/categorized カウントを "• 項目名: N個" 形式で表示
    var message = title + "\\n\\n" +
                  "【処理結果】\\n" +
                  "• 名前変更: " + stats.renamed + "個\\n" +
                  "• 削除: " + stats.removed + "個\\n" +
                  "• 分類: " + stats.categorized + "個\\n";
    
    // エラー発生時のみエラーカウントを追加表示
    if (stats.errors > 0) {
        message += "• エラー: " + stats.errors + "個\\n";
    }
    
    // 中断・完了それぞれの終了メッセージを追加
    if (stats && stats.cancelled) {
        message += "\\n処理はユーザーにより中断されました。";
    } else {
        message += "\\n処理が正常に完了しました♡";
    }
    
    // alert ダイアログで統計情報を表示
    alert(message);
}

/**
 * プレビューダイアログの表示（Phase 2 実装予定）
 * 
 * レイヤー整理処理の実行前に、変更内容のプレビューを表示する機能。
 * Phase 1 では未実装のため、実装予定のメッセージを表示する。
 * Phase 2 で実装される予定：
 * - 変更前・変更後のレイヤー名比較表示
 * - 削除対象レイヤーのハイライト表示
 * - カテゴリ分類結果のツリー表示
 * 
 * @param {Object} settings - プレビュー対象の整理設定オブジェクト
 */
function showPreviewDialog(settings) {
    // Phase 2 実装予定を通知
    alert("プレビュー機能は開発中です。\\n\\nPhase 2で実装予定です♡");
}

/**
 * ヘルプダイアログを表示
 * 
 * スクリプトの機能説明、使い方、注意事項をユーザーに通知する。
 * メインダイアログのヘルプボタンから呼び出される。
 * 表示内容：
 * - 主な機能一覧（空レイヤー削除、自動リネーム、カテゴリ分類）
 * - 基本的な使用手順
 * - 実行前の注意事項（保存推奨、ロック除外、Undo可能）
 */
function showHelpDialog() {
    // ヘルプテキストの構築
    // 機能説明・使い方・注意事項を \\n で整形して表示
    var helpText = "【AI レイヤー整理ツール ヘルプ】\\n\\n" +
                   "このツールは、Illustratorのレイヤー構造を自動で整理します。\\n\\n" +
                   "【主な機能】\\n" +
                   "• 空レイヤーの自動削除\\n" +
                   "• レイヤー名の自動リネーム\\n" +
                   "• カテゴリ別自動分類（Phase 2予定）\\n\\n" +
                   "【使い方】\\n" +
                   "1. 整理したいドキュメントを開く\\n" +
                   "2. オプションを選択\\n" +
                   "3. '実行'ボタンをクリック\\n\\n" +
                   "【注意事項】\\n" +
                   "• 実行前にドキュメントを保存することを推奨\\n" +
                   "• ロックレイヤーは除外可能\\n" +
                   "• 処理は元に戻す(Undo)で復元可能\\n\\n" +
                   "by 月代観るな ♡";
    
    // alert ダイアログでヘルプテキストを表示
    alert(helpText);
}

/**
 * ユーザー設定を保存（Phase 2 実装予定）
 * 
 * ユーザーが選択した整理オプション設定を永続化する。
 * 次回起動時に前回の設定を復元できるようにする。
 * Phase 1 では未実装のため、デバッグログ出力のみ行う。
 * Phase 2 で実装される予定：
 * - 設定ファイル（JSON形式）への書き込み
 * - app.preferences または外部ファイルへの保存
 * - スクリプト起動時の自動読み込み
 * 
 * @param {Object} settings - 保存対象の設定オブジェクト
 */
function saveUserSettings(settings) {
    // Phase 2 実装予定のため、現在はデバッグログ出力のみ
    // JSON.stringify で設定内容をシリアライズしてログに記録
    debugLog("設定保存: " + JSON.stringify(settings));
}

/**
 * エラーハンドリングと通知
 * 
 * スクリプト実行中のエラー発生時に呼び出される。
 * ユーザーにエラー内容を通知し、デバッグログに詳細を記録する。
 * プログレスウィンドウが開いている場合は自動的にクローズする。
 * これによりエラー発生時も適切にリソースを解放する。
 * 
 * @param {String} message - ユーザー向けエラーメッセージ
 * @param {Error} error - Error オブジェクト（error.message でエラー詳細取得）
 */
function handleError(message, error) {
    // エラーメッセージの構築
    // message にエラー詳細を追加して整形
    // error.message が取得できない場合は "不明なエラー" をフォールバック
    var errorMsg = message + "\\n\\n" +
                   "エラー詳細: " + (error ? error.message : "不明なエラー") + "\\n\\n" +
                   "スクリプトを終了します。";
    
    // alert ダイアログでユーザーにエラー通知
    alert(errorMsg);
    
    // debugLog でコンソールにエラー詳細を記録
    // ExtendScript Toolkit でエラー追跡が可能になる
    debugLog("ERROR: " + message + " - " + (error ? error.message : "unknown"));
    
    // プログレスウィンドウが開いていれば閉じる
    // エラー終了時もリソースを適切に解放
    closeProgressWindow();
}

/**
 * デバッグログ出力
 * 
 * DEBUG_MODE が true の場合のみ、メッセージをコンソールに出力する。
 * ExtendScript Toolkit のコンソールパネルに表示されるため、
 * スクリプト開発時のデバッグやトラブルシューティングに活用できる。
 * タイムスタンプ付きでログを記録し、処理の時系列追跡が可能。
 * 
 * @param {String} message - コンソールに出力するデバッグメッセージ
 */
function debugLog(message) {
    // DEBUG_MODE が true の場合のみログ出力
    // 本番環境では DEBUG_MODE = false にすることでログを無効化
    if (DEBUG_MODE) {
        // $.writeln で ExtendScript Toolkit のコンソールに出力
        // new Date().toLocaleTimeString() でタイムスタンプを追加
        // "[HH:MM:SS] message" 形式でログを記録
        $.writeln("[" + new Date().toLocaleTimeString() + "] " + message);
    }
}

// ============================================================================
// スクリプト実行部分
// ============================================================================

// スクリプトが直接実行された場合のメイン処理
if (typeof main === "function") {
    main();
}
