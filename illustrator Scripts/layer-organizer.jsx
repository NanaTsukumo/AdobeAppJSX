/**
 * AI Layer Organizer for Illustrator
 * レイヤー自動整理ツール
 * 
 * @version 1.0.0-alpha.1
 * @author 月代観るな (Luna Tsukuyomi)
 * @license Apache-2.0
 * @description Illustratorのレイヤー構造を自動で整理・最適化するスクリプト
 * @requires Adobe Illustrator CC 2020+
 * @created 2025-09-11
 * @updated 2025-09-11
 * @status Alpha - Phase 1実装中
 * 
 * 要件定義: SystemPrompts/Adobe/layer-organizer-requirements.md
 */

// グローバル変数とデバッグ設定
var SCRIPT_VERSION = "1.0.0-alpha.1";
var DEBUG_MODE = true;
var PROGRESS_WINDOW = null;
var CANCEL_REQUESTED = false;

// レイヤー整理設定
var ORGANIZER_SETTINGS = {
    // 命名規則設定
    naming: {
        text: "Text_{content}",
        shape: "Shape_{type}_{color}", 
        image: "Image_{filename}",
        path: "Path_{points}pt",
        mixed: "Mixed_{main}"
    },
    
    // カテゴリ分類設定
    categories: {
        text: "Text/",
        shapes: "Shapes/",
        images: "Images/", 
        background: "Background/",
        decorations: "Decorations/"
    },
    
    // 除外設定
    exclude: {
        locked: false,
        hidden: false,
        pattern: ""
    },
    
    // 整理オプション
    options: {
        removeEmpty: true,
        autoRename: true,
        categorize: false,
        colorGroup: false,
        sizeSort: false
    }
};

/**
 * メイン実行関数
 */
function main() {
    try {
        debugLog("=== AI レイヤー整理ツール 開始 ===");
        
        // 環境チェック
        if (!validateEnvironment()) {
            return;
        }
        
        // UI表示・設定取得
        var userSettings = showMainDialog();
        if (!userSettings) {
            debugLog("ユーザーによりキャンセルされました");
            return;
        }
        
        // 設定をマージ
        mergeSettings(userSettings);
        
        // 実行確認
        if (!showConfirmDialog()) {
            return;
        }
        
        // レイヤー整理実行
        executeLayerOrganization();
        
        debugLog("=== レイヤー整理完了 ===");
        
    } catch (error) {
        handleError("メイン処理でエラーが発生しました", error);
    }
}

/**
 * 環境・前提条件の検証
 */
function validateEnvironment() {
    debugLog("環境チェック開始...");
    
    // ドキュメントの存在確認
    if (!app.documents.length) {
        alert("エラー: ドキュメントが開かれていません。\\n" +
              "Illustratorでドキュメントを開いてから再実行してください。");
        return false;
    }
    
    var doc = app.activeDocument;
    
    // レイヤーの存在確認
    if (!doc.layers.length) {
        alert("エラー: ドキュメントにレイヤーが存在しません。");
        return false;
    }
    
    // 編集可能状態確認
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
 */
function showMainDialog() {
    debugLog("メインダイアログ表示...");
    
    var dialog = new Window("dialog", "AI レイヤー整理ツール v" + SCRIPT_VERSION);
    dialog.orientation = "column";
    dialog.alignChildren = "left";
    dialog.spacing = 15;
    dialog.margins = 20;
    
    // === プリセット選択グループ ===
    var presetGroup = dialog.add("panel", undefined, "整理プリセット");
    presetGroup.orientation = "column";
    presetGroup.alignChildren = "left";
    presetGroup.spacing = 8;
    presetGroup.margins = 15;
    
    var preset1 = presetGroup.add("radiobutton", undefined, "デフォルト整理（推奨）");
    var preset2 = presetGroup.add("radiobutton", undefined, "印刷用最適化");
    var preset3 = presetGroup.add("radiobutton", undefined, "Web用最適化");
    var preset4 = presetGroup.add("radiobutton", undefined, "カスタム設定");
    
    preset1.value = true; // デフォルト選択
    
    // === 整理オプショングループ ===
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
 */
function showConfirmDialog() {
    var doc = app.activeDocument;
    var layerCount = doc.layers.length;
    
    var message = "レイヤー整理を実行します。\\n\\n" +
                  "対象レイヤー数: " + layerCount + "個\\n" +
                  "処理内容: 命名、整理、最適化\\n\\n" +
                  "※実行前にドキュメントを保存することをお勧めします。\\n\\n" +
                  "続行しますか？";
    
    return confirm(message);
}

/**
 * レイヤー整理のメイン実行処理
 */
function executeLayerOrganization() {
    debugLog("レイヤー整理実行開始...");
    
    var doc = app.activeDocument;
    
    // プログレスバー表示（選択されたフェーズ数を最大値に設定）
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
 */
function removeEmptyLayers(stats) {
    debugLog("空レイヤー除去開始...");
    
    var doc = app.activeDocument;
    var removedCount = 0;
    var layersToRemove = [];
    
    // 削除対象レイヤーを特定（逆順でチェック）
    for (var i = doc.layers.length - 1; i >= 0; i--) {
        var layer = doc.layers[i];
        
        // 除外条件チェック
        if (shouldExcludeLayer(layer)) {
            continue;
        }
        
        // 空レイヤー判定
        if (isEmptyLayer(layer)) {
            layersToRemove.push(layer.name);
        }
    }
    
    // 削除前確認
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
 */
function renameLayersAutomatically(stats) {
    debugLog("レイヤー自動リネーム開始...");
    
    var doc = app.activeDocument;
    var renamedCount = 0;
    
    for (var i = 0; i < doc.layers.length; i++) {
        if (CANCEL_REQUESTED) { break; }
        var layer = doc.layers[i];
        
        // 除外条件チェック
        if (shouldExcludeLayer(layer)) {
            continue;
        }
        
        try {
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
 */
function shouldExcludeLayer(layer) {
    // ロックレイヤー除外設定
    if (ORGANIZER_SETTINGS.exclude.locked && layer.locked) {
        return true;
    }
    
    // 非表示レイヤー除外設定
    if (ORGANIZER_SETTINGS.exclude.hidden && !layer.visible) {
        return true;
    }
    
    // 特定パターン除外（正規表現）
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
 */
function generateLayerName(layer) {
    try {
        var items = layer.pageItems;
        if (items.length === 0) {
            return null; // 空レイヤーは名前変更しない
        }
        
        // 主要オブジェクトの種類を判定
        var mainType = determineMainObjectType(layer);
        var newName = "";
        
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
 */
function determineMainObjectType(layer) {
    var items = layer.pageItems;
    var textCount = 0;
    var shapeCount = 0;
    var imageCount = 0;
    var pathCount = 0;
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        if (item.typename === "TextFrame") {
            textCount++;
        } else if (item.typename === "PlacedItem" || item.typename === "RasterItem") {
            imageCount++;
        } else if (item.typename === "PathItem") {
            if (item.filled || item.stroked) {
                shapeCount++;
            } else {
                pathCount++;
            }
        }
    }
    
    // 最も多いタイプを返す
    var max = Math.max(textCount, shapeCount, imageCount, pathCount);
    if (max === textCount) return "text";
    if (max === shapeCount) return "shape";
    if (max === imageCount) return "image";
    if (max === pathCount) return "path";
    
    return "mixed";
}

/**
 * テキストレイヤー名の生成
 */
function generateTextLayerName(layer) {
    try {
        var textFrames = [];
        for (var i = 0; i < layer.pageItems.length; i++) {
            if (layer.pageItems[i].typename === "TextFrame") {
                textFrames.push(layer.pageItems[i]);
            }
        }
        
        if (textFrames.length > 0) {
            var firstText = textFrames[0].contents;
            // 最初の8文字を取得（改行・特殊文字を除去）
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
 */
function generateShapeLayerName(layer) {
    try {
        // シンプルな形状タイプ判定
        var shapeType = "Generic";
        var colorInfo = "";
        
        // 最初の図形オブジェクトから情報取得
        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            if (item.typename === "PathItem" && (item.filled || item.stroked)) {
                // 基本的な形状判定
                if (item.pathPoints.length === 4) {
                    shapeType = "Rect";
                } else if (item.pathPoints.length > 8) {
                    shapeType = "Circle";
                } else {
                    shapeType = "Shape";
                }
                
                // 色情報取得（簡略化）
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
 */
function generateImageLayerName(layer) {
    try {
        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            if (item.typename === "PlacedItem" || item.typename === "RasterItem") {
                // ファイル名を取得（パスから抽出）
                var filename = "Unknown";
                try {
                    if (item.typename === "PlacedItem" && item.file) {
                        var filePath = item.file.toString();
                        var parts = filePath.split("/");
                        if (parts.length > 0) {
                            filename = parts[parts.length - 1].replace(/\.[^.]+$/, ""); // 拡張子除去
                        }
                    } else if (item.typename === "RasterItem") {
                        filename = "Raster";
                    }
                } catch (e) {
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
 */
function generatePathLayerName(layer) {
    try {
        var totalPoints = 0;
        var pathCount = 0;
        
        for (var i = 0; i < layer.pageItems.length; i++) {
            var item = layer.pageItems[i];
            if (item.typename === "PathItem" && !item.filled && !item.stroked) {
                totalPoints += item.pathPoints.length;
                pathCount++;
            }
        }
        
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
 */
function generateMixedLayerName(layer) {
    try {
        var itemCount = layer.pageItems.length;
        return "Mixed_" + itemCount + "items";
    } catch (error) {
        return "Mixed_Error";
    }
}

/**
 * 色情報の簡略取得
 */
function getColorInfo(fillColor) {
    try {
        if (fillColor.typename === "RGBColor") {
            // RGB値から代表色を判定
            var r = fillColor.red;
            var g = fillColor.green;
            var b = fillColor.blue;
            
            if (r > 200 && g > 200 && b > 200) return "White";
            if (r < 50 && g < 50 && b < 50) return "Black";
            if (r > g && r > b) return "Red";
            if (g > r && g > b) return "Green";
            if (b > r && b > g) return "Blue";
            return "Color";
        }
        return "Fill";
    } catch (error) {
        return "Unknown";
    }
}

/**
 * 設定のマージ
 */
function mergeSettings(userSettings) {
    if (userSettings) {
        if (userSettings.options) {
            for (var key in userSettings.options) {
                if (userSettings.options.hasOwnProperty(key)) {
                    ORGANIZER_SETTINGS.options[key] = userSettings.options[key];
                }
            }
        }
        
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
 */
function showProgressWindow(message, maxValue) {
    CANCEL_REQUESTED = false;
    PROGRESS_WINDOW = new Window("window", "処理中...");
    PROGRESS_WINDOW.orientation = "column";
    PROGRESS_WINDOW.alignChildren = "fill";
    PROGRESS_WINDOW.margins = 12;
    PROGRESS_WINDOW.messageText = PROGRESS_WINDOW.add("statictext", undefined, message);
    PROGRESS_WINDOW.progressBar = PROGRESS_WINDOW.add("progressbar", undefined, 0, maxValue);
    PROGRESS_WINDOW.progressBar.preferredSize.width = 320;
    var g = PROGRESS_WINDOW.add("group");
    g.alignment = "right";
    var cancelBtn = g.add("button", undefined, "キャンセル");
    cancelBtn.onClick = function() {
        CANCEL_REQUESTED = true;
        PROGRESS_WINDOW.text = "キャンセル要求中...";
    };
    PROGRESS_WINDOW.show();
}

/**
 * プログレス更新
 */
function updateProgress(value, message) {
    if (PROGRESS_WINDOW && PROGRESS_WINDOW.progressBar) {
        PROGRESS_WINDOW.progressBar.value = value;
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
 * プログレスウィンドウ閉じる
 */
function closeProgressWindow() {
    if (PROGRESS_WINDOW) {
        PROGRESS_WINDOW.close();
        PROGRESS_WINDOW = null;
    }
}

/**
 * 結果レポートダイアログ
 */
function showResultDialog(stats) {
    var title = (stats && stats.cancelled) ? "レイヤー整理はキャンセルされました" : "レイヤー整理が完了しました！";
    var message = title + "\\n\\n" +
                  "【処理結果】\\n" +
                  "• 名前変更: " + stats.renamed + "個\\n" +
                  "• 削除: " + stats.removed + "個\\n" +
                  "• 分類: " + stats.categorized + "個\\n";
    
    if (stats.errors > 0) {
        message += "• エラー: " + stats.errors + "個\\n";
    }
    
    if (stats && stats.cancelled) {
        message += "\\n処理はユーザーにより中断されました。";
    } else {
        message += "\\n処理が正常に完了しました♡";
    }
    
    alert(message);
}

/**
 * プレビューダイアログ（将来実装）
 */
function showPreviewDialog(settings) {
    alert("プレビュー機能は開発中です。\\n\\nPhase 2で実装予定です♡");
}

/**
 * ヘルプダイアログ
 */
function showHelpDialog() {
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
    
    alert(helpText);
}

/**
 * ユーザー設定の保存（将来実装）
 */
function saveUserSettings(settings) {
    // TODO: 設定ファイルへの保存機能
    debugLog("設定保存: " + JSON.stringify(settings));
}

/**
 * エラーハンドリング
 */
function handleError(message, error) {
    var errorMsg = message + "\\n\\n" +
                   "エラー詳細: " + (error ? error.message : "不明なエラー") + "\\n\\n" +
                   "スクリプトを終了します。";
    
    alert(errorMsg);
    debugLog("ERROR: " + message + " - " + (error ? error.message : "unknown"));
    
    // プログレスウィンドウが開いていれば閉じる
    closeProgressWindow();
}

/**
 * デバッグログ出力
 */
function debugLog(message) {
    if (DEBUG_MODE) {
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
