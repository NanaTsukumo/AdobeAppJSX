// Illustrator面付け自動化スクリプト v2.0
// 月代観るな製 - お兄さん専用面付けツール♡

// グローバル変数
var PREFERENCES_KEY = "ImpositionScript";
var progressWindow = null;

function createImpositionGUI() {
    // ダイアログウィンドウを作成
    var dialog = new Window("dialog", "面付け自動化ツール");
    dialog.orientation = "column";
    dialog.alignChildren = "left";
    dialog.spacing = 10;
    dialog.margins = 16;

    // 設定パネル
    var settingsPanel = dialog.add("panel", undefined, "面付け設定");
    settingsPanel.orientation = "column";
    settingsPanel.alignChildren = "left";
    settingsPanel.spacing = 5;
    settingsPanel.margins = 10;

    // 行・列数設定
    var rowGroup = settingsPanel.add("group");
    rowGroup.add("statictext", undefined, "行数:");
    var rowInput = rowGroup.add("edittext", undefined, "2");
    rowInput.characters = 5;
    
    // 数値のみ入力制限
    rowInput.onChanging = function() {
        this.text = this.text.replace(/[^0-9]/g, "");
        if (parseInt(this.text) > 20) this.text = "20";
    };

    var colGroup = settingsPanel.add("group");
    colGroup.add("statictext", undefined, "列数:");
    var colInput = colGroup.add("edittext", undefined, "2");
    colInput.characters = 5;
    
    // 数値のみ入力制限
    colInput.onChanging = function() {
        this.text = this.text.replace(/[^0-9]/g, "");
        if (parseInt(this.text) > 20) this.text = "20";
    };

    // 間隔設定
    var spacingGroup = settingsPanel.add("group");
    spacingGroup.add("statictext", undefined, "間隔(mm):");
    var spacingInput = spacingGroup.add("edittext", undefined, "5");
    spacingInput.characters = 5;
    
    // 数値と小数点のみ入力制限
    spacingInput.onChanging = function() {
        this.text = this.text.replace(/[^0-9.]/g, "");
        var parts = this.text.split(".");
        if (parts.length > 2) this.text = parts[0] + "." + parts[1];
        if (parseFloat(this.text) > 100) this.text = "100";
    };

    // 用紙サイズ設定
    var paperGroup = settingsPanel.add("group");
    paperGroup.add("statictext", undefined, "用紙サイズ:");
    var paperDropdown = paperGroup.add("dropdownlist", undefined, ["A4", "A3", "B4", "B5", "カスタム"]);
    paperDropdown.selection = 0;

    // カスタムサイズ設定（初期は非表示）
    var customGroup = settingsPanel.add("group");
    customGroup.add("statictext", undefined, "幅(mm):");
    var widthInput = customGroup.add("edittext", undefined, "210");
    widthInput.characters = 8;
    customGroup.add("statictext", undefined, "高さ(mm):");
    var heightInput = customGroup.add("edittext", undefined, "297");
    heightInput.characters = 8;
    customGroup.visible = false;

    // 用紙サイズ変更時の処理
    paperDropdown.onChange = function() {
        customGroup.visible = (paperDropdown.selection.text === "カスタム");
    };

    // オプション設定
    var optionsPanel = dialog.add("panel", undefined, "オプション");
    optionsPanel.orientation = "column";
    optionsPanel.alignChildren = "left";
    optionsPanel.spacing = 5;
    optionsPanel.margins = 10;

    var centerCheck = optionsPanel.add("checkbox", undefined, "用紙中央に配置");
    centerCheck.value = true;
    var trimMarkCheck = optionsPanel.add("checkbox", undefined, "トンボを追加");
    trimMarkCheck.value = false;

    // 設定保存・復元
    var saveGroup = optionsPanel.add("group");
    var saveBtn = saveGroup.add("button", undefined, "設定保存");
    var loadBtn = saveGroup.add("button", undefined, "設定復元");
    
    // 設定保存
    saveBtn.onClick = function() {
        try {
            var settings = {
                rows: rowInput.text,
                cols: colInput.text,
                spacing: spacingInput.text,
                paper: paperDropdown.selection.index,
                width: widthInput.text,
                height: heightInput.text,
                center: centerCheck.value,
                trimMarks: trimMarkCheck.value
            };
            app.preferences.setStringPreference(PREFERENCES_KEY, settings.toSource());
            alert("設定を保存しました♡");
        } catch(e) {
            alert("設定保存エラー: " + e.message);
        }
    };
    
    // 設定復元
    loadBtn.onClick = function() {
        try {
            var savedSettings = app.preferences.getStringPreference(PREFERENCES_KEY);
            if (savedSettings) {
                var settings = eval("(" + savedSettings + ")");
                rowInput.text = settings.rows || "2";
                colInput.text = settings.cols || "2";
                spacingInput.text = settings.spacing || "5";
                paperDropdown.selection = settings.paper || 0;
                widthInput.text = settings.width || "210";
                heightInput.text = settings.height || "297";
                centerCheck.value = settings.center !== undefined ? settings.center : true;
                trimMarkCheck.value = settings.trimMarks !== undefined ? settings.trimMarks : false;
                customGroup.visible = (paperDropdown.selection.text === "カスタム");
                alert("設定を復元しました♡");
            } else {
                alert("保存された設定がありません〜");
            }
        } catch(e) {
            alert("設定復元エラー: " + e.message);
        }
    };

    // ボタン
    var buttonGroup = dialog.add("group");
    var executeBtn = buttonGroup.add("button", undefined, "実行");
    var cancelBtn = buttonGroup.add("button", undefined, "キャンセル");

    // 実行ボタンの処理
    executeBtn.onClick = function() {
        try {
            // バリデーション
            var validation = validateInputs(rowInput.text, colInput.text, spacingInput.text, 
                                          paperDropdown.selection.text, widthInput.text, heightInput.text);
            if (!validation.valid) {
                alert("入力エラー: " + validation.message);
                return;
            }
            
            var rows = parseInt(rowInput.text);
            var cols = parseInt(colInput.text);
            var spacing = parseFloat(spacingInput.text);
            var paperSize = getPaperSize(paperDropdown.selection.text, widthInput.text, heightInput.text);
            
            // 確認ダイアログ
            var confirmMsg = "面付け設定:\n";
            confirmMsg += "- " + rows + "行 × " + cols + "列\n";
            confirmMsg += "- 間隔: " + spacing + "mm\n";
            confirmMsg += "- 用紙: " + paperSize.width + "×" + paperSize.height + "mm\n";
            confirmMsg += "\n実行しますか？";
            
            if (confirm(confirmMsg)) {
                dialog.close();
                executeImposition(rows, cols, spacing, paperSize, centerCheck.value, trimMarkCheck.value);
            }
        } catch(e) {
            alert("エラー: " + e.message);
        }
    };

    cancelBtn.onClick = function() {
        dialog.close();
    };

    // 初期設定読み込み
    initializeSettings(rowInput, colInput, spacingInput, paperDropdown, widthInput, heightInput, centerCheck, trimMarkCheck, customGroup);

    dialog.show();
}

// 入力バリデーション関数
function validateInputs(rows, cols, spacing, paperType, width, height) {
    // 行・列数チェック
    if (!rows || rows === "" || isNaN(parseInt(rows)) || parseInt(rows) <= 0 || parseInt(rows) > 20) {
        return {valid: false, message: "行数は1〜20の数値で入力してください"};
    }
    
    if (!cols || cols === "" || isNaN(parseInt(cols)) || parseInt(cols) <= 0 || parseInt(cols) > 20) {
        return {valid: false, message: "列数は1〜20の数値で入力してください"};
    }
    
    // 間隔チェック
    if (!spacing || spacing === "" || isNaN(parseFloat(spacing)) || parseFloat(spacing) < 0 || parseFloat(spacing) > 100) {
        return {valid: false, message: "間隔は0〜100の数値で入力してください"};
    }
    
    // カスタムサイズチェック
    if (paperType === "カスタム") {
        if (!width || width === "" || isNaN(parseFloat(width)) || parseFloat(width) <= 0 || parseFloat(width) > 1000) {
            return {valid: false, message: "用紙幅は1〜1000の数値で入力してください"};
        }
        if (!height || height === "" || isNaN(parseFloat(height)) || parseFloat(height) <= 0 || parseFloat(height) > 1000) {
            return {valid: false, message: "用紙高さは1〜1000の数値で入力してください"};
        }
    }
    
    return {valid: true};
}

function getPaperSize(paperType, customWidth, customHeight) {
    var sizes = {
        "A4": {width: 210, height: 297},
        "A3": {width: 297, height: 420},
        "B4": {width: 257, height: 364},
        "B5": {width: 182, height: 257}
    };
    
    if (paperType === "カスタム") {
        return {width: parseFloat(customWidth), height: parseFloat(customHeight)};
    }
    return sizes[paperType];
}

function executeImposition(rows, cols, spacing, paperSize, centerAlign, addTrimMarks) {
    // 基本チェック
    if (!app.activeDocument) {
        alert("アクティブなドキュメントがありません。\nIllustratorでドキュメントを開いてから実行してください。");
        return;
    }

    var doc = app.activeDocument;
    var selection = doc.selection;
    
    if (selection.length === 0) {
        alert("面付けするオブジェクトを選択してください。\n選択後にもう一度実行してください。");
        return;
    }

    // Undo用のスナップショット作成
    app.executeMenuCommand("undo");
    app.executeMenuCommand("redo"); // これでundo履歴に追加される
    
    try {
        var totalObjects = rows * cols;
        showProgress("面付け処理中...", 0, totalObjects);
        
        // 選択オブジェクトをグループ化（複数選択対応）
        var originalGroup;
        if (selection.length === 1) {
            originalGroup = selection[0];
        } else {
            originalGroup = doc.groupItems.add();
            for (var i = selection.length - 1; i >= 0; i--) {
                selection[i].move(originalGroup, ElementPlacement.PLACEATBEGINNING);
            }
        }

        // 正確なbounds取得（Illustratorの座標系考慮）
        var bounds = originalGroup.geometricBounds; // [left, top, right, bottom]
        var objWidth = Math.abs(bounds[2] - bounds[0]);   // right - left
        var objHeight = Math.abs(bounds[1] - bounds[3]);  // top - bottom

        // 単位をポイントに変換（1mm = 2.834645669 pt）
        var spacingPt = spacing * 2.834645669;
        var paperWidthPt = paperSize.width * 2.834645669;
        var paperHeightPt = paperSize.height * 2.834645669;

        // 配置可能チェック
        var totalWidth = (cols * objWidth) + ((cols - 1) * spacingPt);
        var totalHeight = (rows * objHeight) + ((rows - 1) * spacingPt);
        
        if (totalWidth > paperWidthPt || totalHeight > paperHeightPt) {
            hideProgress();
            var overMsg = "警告: 面付け結果が用紙サイズを超過します。\n";
            overMsg += "必要サイズ: " + Math.round(totalWidth/2.834645669) + "×" + Math.round(totalHeight/2.834645669) + "mm\n";
            overMsg += "用紙サイズ: " + paperSize.width + "×" + paperSize.height + "mm\n";
            overMsg += "\n続行しますか？";
            if (!confirm(overMsg)) return;
        }

        // 開始位置計算（Illustrator座標系: Y軸は上が正）
        var startX = bounds[0]; // 元の左端位置
        var startY = bounds[1]; // 元の上端位置
        
        if (centerAlign) {
            startX = (paperWidthPt - totalWidth) / 2;
            startY = (paperHeightPt + totalHeight) / 2; // Y軸反転考慮
        }

        var processedCount = 1; // 元のオブジェクト分
        
        // 面付け実行（効率化）
        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                if (row === 0 && col === 0) {
                    // 元のオブジェクトを移動
                    var deltaX = startX - bounds[0];
                    var deltaY = startY - bounds[1];
                    if (deltaX !== 0 || deltaY !== 0) {
                        originalGroup.translate(deltaX, deltaY);
                    }
                } else {
                    // 複製作成
                    var duplicate = originalGroup.duplicate();
                    
                    var newX = startX + (col * (objWidth + spacingPt));
                    var newY = startY - (row * (objHeight + spacingPt)); // Y軸下向きに配置
                    
                    var deltaX = newX - bounds[0];
                    var deltaY = newY - bounds[1];
                    duplicate.translate(deltaX, deltaY);
                }
                
                updateProgress(processedCount++, totalObjects);
            }
        }

        // トンボ追加
        if (addTrimMarks) {
            updateProgress(totalObjects, totalObjects, "トンボ作成中...");
            createProfessionalTrimMarks(doc, paperWidthPt, paperHeightPt);
        }

        hideProgress();
        
        var completeMsg = "面付けが完了しました！♡\n";
        completeMsg += "- " + rows + "行 × " + cols + "列 (" + totalObjects + "個)\n";
        completeMsg += "- 用紙: " + paperSize.width + "×" + paperSize.height + "mm";
        if (addTrimMarks) completeMsg += "\n- トンボ追加済み";
        alert(completeMsg);
        
    } catch(e) {
        hideProgress();
        alert("面付け処理中にエラーが発生しました:\n" + e.message + "\n\nCtrl+Zで取り消すことができます。");
    }
}

// プログレスバー表示関数
function showProgress(message, current, total) {
    if (progressWindow) progressWindow.close();
    
    progressWindow = new Window("dialog", "処理中");
    progressWindow.orientation = "column";
    progressWindow.alignChildren = "fill";
    progressWindow.spacing = 10;
    progressWindow.margins = 16;
    
    var msgLabel = progressWindow.add("statictext", undefined, message);
    msgLabel.alignment = "center";
    
    var progressBar = progressWindow.add("progressbar", undefined, current, total);
    progressBar.preferredSize.width = 300;
    
    var statusLabel = progressWindow.add("statictext", undefined, current + " / " + total);
    statusLabel.alignment = "center";
    
    progressWindow.show();
    progressWindow.update();
}

function updateProgress(current, total, message) {
    if (!progressWindow) return;
    
    try {
        if (message) progressWindow.children[0].text = message;
        progressWindow.children[1].value = current;
        progressWindow.children[2].text = current + " / " + total;
        progressWindow.update();
    } catch(e) {
        // プログレス更新エラーは無視
    }
}

function hideProgress() {
    if (progressWindow) {
        progressWindow.close();
        progressWindow = null;
    }
}

// 印刷業界標準のトンボ作成関数
function createProfessionalTrimMarks(doc, width, height) {
    try {
        var trimGroup = doc.groupItems.add();
        trimGroup.name = "トンボ_" + new Date().getTime();
        
        var trimLength = 8.504; // 3mm
        var trimOffset = 8.504; // 3mm
        var strokeWidth = 0.25;  // 0.1mm
        
        // 色設定（レジストレーションカラー）
        var trimColor = doc.spots.add();
        trimColor.name = "トンボ";
        trimColor.color.spot.colorType = ColorModel.REGISTRATION;
        
        // 四隅のコーナートンボ
        var corners = [
            {x: -trimOffset, y: trimOffset},           // 左上
            {x: width + trimOffset, y: trimOffset},     // 右上
            {x: -trimOffset, y: -height - trimOffset}, // 左下
            {x: width + trimOffset, y: -height - trimOffset} // 右下
        ];
        
        for (var i = 0; i < corners.length; i++) {
            var corner = corners[i];
            
            // 横線
            var hLine = doc.pathItems.add();
            hLine.setEntirePath([
                [corner.x - trimLength, corner.y], 
                [corner.x + trimLength, corner.y]
            ]);
            hLine.strokeWidth = strokeWidth;
            hLine.strokeColor = trimColor.color;
            hLine.filled = false;
            hLine.move(trimGroup, ElementPlacement.PLACEATBEGINNING);
            
            // 縦線
            var vLine = doc.pathItems.add();
            vLine.setEntirePath([
                [corner.x, corner.y - trimLength], 
                [corner.x, corner.y + trimLength]
            ]);
            vLine.strokeWidth = strokeWidth;
            vLine.strokeColor = trimColor.color;
            vLine.filled = false;
            vLine.move(trimGroup, ElementPlacement.PLACEATBEGINNING);
        }
        
        // センタートンボ（上下左右の中央）
        var centers = [
            {x: width/2, y: trimOffset},              // 上
            {x: width/2, y: -height - trimOffset},   // 下
            {x: -trimOffset, y: -height/2},          // 左
            {x: width + trimOffset, y: -height/2}    // 右
        ];
        
        for (var j = 0; j < centers.length; j++) {
            var center = centers[j];
            var isVertical = (j >= 2); // 左右のトンボは縦線
            
            var centerLine = doc.pathItems.add();
            if (isVertical) {
                centerLine.setEntirePath([
                    [center.x, center.y - trimLength/2], 
                    [center.x, center.y + trimLength/2]
                ]);
            } else {
                centerLine.setEntirePath([
                    [center.x - trimLength/2, center.y], 
                    [center.x + trimLength/2, center.y]
                ]);
            }
            centerLine.strokeWidth = strokeWidth;
            centerLine.strokeColor = trimColor.color;
            centerLine.filled = false;
            centerLine.move(trimGroup, ElementPlacement.PLACEATBEGINNING);
        }
        
    } catch(e) {
        alert("トンボ作成エラー: " + e.message);
    }
}

}

// 起動時の初期設定復元
function initializeSettings(rowInput, colInput, spacingInput, paperDropdown, widthInput, heightInput, centerCheck, trimMarkCheck, customGroup) {
    try {
        var savedSettings = app.preferences.getStringPreference(PREFERENCES_KEY);
        if (savedSettings) {
            var settings = eval("(" + savedSettings + ")");
            rowInput.text = settings.rows || "2";
            colInput.text = settings.cols || "2";
            spacingInput.text = settings.spacing || "5";
            paperDropdown.selection = settings.paper || 0;
            widthInput.text = settings.width || "210";
            heightInput.text = settings.height || "297";
            centerCheck.value = settings.center !== undefined ? settings.center : true;
            trimMarkCheck.value = settings.trimMarks !== undefined ? settings.trimMarks : false;
            customGroup.visible = (paperDropdown.selection.text === "カスタム");
        }
    } catch(e) {
        // 初期化エラーは無視（デフォルト値で続行）
    }
}

// スクリプト実行
try {
    if (!app.activeDocument) {
        alert("Illustratorでドキュメントを開いてからスクリプトを実行してください。");
    } else {
        createImpositionGUI();
    }
} catch(e) {
    alert("スクリプト起動エラー: " + e.message);
}