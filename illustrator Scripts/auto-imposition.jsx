/**
 * Illustrator面付け自動化スクリプト
 * 
 * @version 0.1.0-alpha.1
 * @author 月代観るな (Luna Tsukuyomi)  
 * @license Apache-2.0
 * @description Adobe Illustrator向けの面付け自動化ツール（開発版）
 * @requires Adobe Illustrator CC 2020+
 * @created 2025-09-07
 * @updated 2025-09-08
 * @status Alpha - 実験的機能、破壊的変更の可能性あり
 */

// グローバル変数
var SCRIPT_VERSION = "0.2.0-alpha.1";
var PREFERENCES_KEY = "ImpositionScript";
var progressWindow = null;

// 印刷業界標準定義
var IMPOSITION_PRESETS = [
    {text: "1up", rows: 1, cols: 1, description: "1面付け（単体配置）"},
    {text: "2up", rows: 1, cols: 2, description: "2面付け（2つ並び）"},
    {text: "4up", rows: 2, cols: 2, description: "4面付け（2×2配置）"},
    {text: "8up", rows: 2, cols: 4, description: "8面付け（2×4配置）"},
    {text: "16up", rows: 4, cols: 4, description: "16面付け（4×4配置）"},
    {text: "カスタム", custom: true, description: "任意の配置"}
];

var FINISHED_SIZES = [
    {text: "名刺 (91×55mm)", width: 91, height: 55},
    {text: "ハガキ (100×148mm)", width: 100, height: 148},
    {text: "A4 (210×297mm)", width: 210, height: 297},
    {text: "A3 (297×420mm)", width: 297, height: 420},
    {text: "B4 (257×364mm)", width: 257, height: 364},
    {text: "B5 (182×257mm)", width: 182, height: 257},
    {text: "カスタム", custom: true}
];

var PARENT_PAPER_SIZES = [
    {text: "A3 (297×420mm)", width: 297, height: 420},
    {text: "A2 (420×594mm)", width: 420, height: 594},
    {text: "B3 (364×515mm)", width: 364, height: 515},
    {text: "A1 (594×841mm)", width: 594, height: 841},
    {text: "菊全判 (636×939mm)", width: 636, height: 939},
    {text: "四六全判 (788×1091mm)", width: 788, height: 1091},
    {text: "カスタム", custom: true}
];

var IMPOSITION_ORIENTATIONS = [
    {text: "左→右、上→下 (標準)", direction: "ltr-ttb"},
    {text: "右→左、上→下 (右綴じ)", direction: "rtl-ttb"},
    {text: "左→右、下→上", direction: "ltr-btt"},
    {text: "天地逆転面付け", direction: "inverted"}
];

var FOLDING_TYPES = [
    {text: "なし", type: "none"},
    {text: "二つ折り", type: "half"},
    {text: "三つ折り（Z折り）", type: "tri-z"},
    {text: "三つ折り（巻き折り）", type: "tri-roll"},
    {text: "四つ折り", type: "quarter"},
    {text: "観音折り", type: "gate"}
];

// 印刷業界標準値
var PRINTING_STANDARDS = {
    minBleed: 3,        // 最小裁ち落とし幅（mm）
    recommendedBleed: 3, // 推奨裁ち落とし幅（mm）
    minGutter: 6,       // 最小ドブ幅（mm）
    recommendedGutter: 8, // 推奨ドブ幅（mm）
    minEfficiency: 70   // 最小用紙効率（%）
};

function createImpositionGUI() {
    // プロ仕様ダイアログウィンドウを作成
    var dialog = new Window("dialog", "面付け自動化ツール Pro v" + SCRIPT_VERSION);
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    dialog.spacing = 10;
    dialog.margins = 16;
    dialog.preferredSize.width = 520;
    dialog.preferredSize.height = 480;

    // メインタブパネル
    var tabPanel = dialog.add("tabbedpanel");
    tabPanel.alignChildren = "fill";
    tabPanel.preferredSize.height = 380;

    // タブ1: 基本設定
    var basicTab = tabPanel.add("tab", undefined, "基本設定");
    basicTab.orientation = "column";
    basicTab.alignChildren = "fill";
    basicTab.spacing = 8;
    basicTab.margins = 10;

    // タブ2: 詳細設定  
    var advancedTab = tabPanel.add("tab", undefined, "詳細設定");
    advancedTab.orientation = "column";
    advancedTab.alignChildren = "fill";
    advancedTab.spacing = 8;
    advancedTab.margins = 10;

    // タブ3: プレビュー
    var previewTab = tabPanel.add("tab", undefined, "プレビュー");
    previewTab.orientation = "column";
    previewTab.alignChildren = "fill";
    previewTab.spacing = 8;
    previewTab.margins = 10;

    // 共有データオブジェクト（タブ間でデータ共有）
    var sharedData = {
        preset: {rows: 1, cols: 2}, // デフォルト2up
        finishedSize: {width: 210, height: 297}, // A4
        parentSize: {width: 297, height: 420},   // A3
        bleed: 3,
        gutter: 8,
        orientation: "ltr-ttb",
        folding: "none",
        centerAlign: true,
        trimMarks: false
    };

    // ========== 基本設定タブの内容 ==========
    // 面付けプリセット
    var impositionPanel = basicTab.add("panel", undefined, "面付けプリセット");
    impositionPanel.orientation = "column";
    impositionPanel.alignChildren = "fill";
    impositionPanel.spacing = 5;
    impositionPanel.margins = 8;

    var presetButtonGroup = impositionPanel.add("group");
    presetButtonGroup.orientation = "row";
    presetButtonGroup.spacing = 5;
    
    var presetButtons = [];
    var selectedPreset = null;
    
    for (var i = 0; i < IMPOSITION_PRESETS.length; i++) {
        var btn = presetButtonGroup.add("button", undefined, IMPOSITION_PRESETS[i].text);
        btn.preferredSize.width = 70;
        btn.preferredSize.height = 30;
        btn.preset = IMPOSITION_PRESETS[i];
        btn.index = i;
        presetButtons.push(btn);
        
        // デフォルトで2upを選択
        if (IMPOSITION_PRESETS[i].text === "2up") {
            selectedPreset = btn;
            btn.text = "● " + btn.text;
        }
        
        btn.onClick = function() {
            // 全ボタンの選択解除
            for (var j = 0; j < presetButtons.length; j++) {
                presetButtons[j].text = presetButtons[j].preset.text;
            }
            // 選択ボタンをマーク
            this.text = "● " + this.preset.text;
            selectedPreset = this;
            
            // 共有データ更新
            if (!this.preset.custom) {
                sharedData.preset = {rows: this.preset.rows, cols: this.preset.cols};
                rowInput.text = this.preset.rows.toString();
                colInput.text = this.preset.cols.toString();
                customRowColGroup.visible = false;
            } else {
                customRowColGroup.visible = true;
            }
            updatePreviewInfo();
        };
    }
    
    // カスタム面付け設定（初期は非表示）
    var customRowColGroup = impositionPanel.add("group");
    customRowColGroup.orientation = "row";
    customRowColGroup.spacing = 10;
    customRowColGroup.visible = false;
    
    customRowColGroup.add("statictext", undefined, "行:");
    var rowInput = customRowColGroup.add("edittext", undefined, "2");
    rowInput.characters = 4;
    customRowColGroup.add("statictext", undefined, "列:");
    var colInput = customRowColGroup.add("edittext", undefined, "2");
    colInput.characters = 4;
    
    // 数値入力制限
    rowInput.onChanging = function() {
        this.text = this.text.replace(/[^0-9]/g, "");
        if (parseInt(this.text) > 10) this.text = "10";
        sharedData.preset.rows = parseInt(this.text) || 1;
        updatePreviewInfo();
    };
    colInput.onChanging = function() {
        this.text = this.text.replace(/[^0-9]/g, "");
        if (parseInt(this.text) > 10) this.text = "10";
        sharedData.preset.cols = parseInt(this.text) || 1;
        updatePreviewInfo();
    };

    // 仕上がりサイズ設定
    var finishedSizePanel = basicTab.add("panel", undefined, "仕上がりサイズ（実際の印刷物サイズ）");
    finishedSizePanel.orientation = "column";
    finishedSizePanel.alignChildren = "fill";
    finishedSizePanel.spacing = 5;
    finishedSizePanel.margins = 8;

    var finishedSizeGroup = finishedSizePanel.add("group");
    finishedSizeGroup.add("statictext", undefined, "サイズ:");
    var finishedDropdown = finishedSizeGroup.add("dropdownlist");
    finishedDropdown.preferredSize.width = 200;
    
    // 仕上がりサイズの選択肢を追加
    for (var k = 0; k < FINISHED_SIZES.length; k++) {
        finishedDropdown.add("item", FINISHED_SIZES[k].text);
    }
    finishedDropdown.selection = 2; // A4をデフォルト

    // カスタム仕上がりサイズ（初期は非表示）
    var customFinishedGroup = finishedSizePanel.add("group");
    customFinishedGroup.spacing = 8;
    customFinishedGroup.visible = false;
    customFinishedGroup.add("statictext", undefined, "幅(mm):");
    var finishedWidthInput = customFinishedGroup.add("edittext", undefined, "210");
    finishedWidthInput.characters = 6;
    customFinishedGroup.add("statictext", undefined, "高さ(mm):");
    var finishedHeightInput = customFinishedGroup.add("edittext", undefined, "297");
    finishedHeightInput.characters = 6;

    // 仕上がりサイズ変更時の処理
    finishedDropdown.onChange = function() {
        var isCustom = (this.selection.index === FINISHED_SIZES.length - 1);
        customFinishedGroup.visible = isCustom;
        
        if (!isCustom) {
            var size = FINISHED_SIZES[this.selection.index];
            sharedData.finishedSize = {width: size.width, height: size.height};
        }
        updatePreviewInfo();
    };

    // 親紙サイズ設定
    var parentSizePanel = basicTab.add("panel", undefined, "親紙サイズ（実際に印刷する用紙）");
    parentSizePanel.orientation = "column";
    parentSizePanel.alignChildren = "fill";
    parentSizePanel.spacing = 5;
    parentSizePanel.margins = 8;

    var parentSizeGroup = parentSizePanel.add("group");
    parentSizeGroup.add("statictext", undefined, "用紙:");
    var parentDropdown = parentSizeGroup.add("dropdownlist");
    parentDropdown.preferredSize.width = 200;
    
    // 親紙サイズの選択肢を追加
    for (var l = 0; l < PARENT_PAPER_SIZES.length; l++) {
        parentDropdown.add("item", PARENT_PAPER_SIZES[l].text);
    }
    parentDropdown.selection = 0; // A3をデフォルト

    // カスタム親紙サイズ（初期は非表示）
    var customParentGroup = parentSizePanel.add("group");
    customParentGroup.spacing = 8;
    customParentGroup.visible = false;
    customParentGroup.add("statictext", undefined, "幅(mm):");
    var parentWidthInput = customParentGroup.add("edittext", undefined, "297");
    parentWidthInput.characters = 6;
    customParentGroup.add("statictext", undefined, "高さ(mm):");
    var parentHeightInput = customParentGroup.add("edittext", undefined, "420");
    parentHeightInput.characters = 6;

    // 親紙サイズ変更時の処理
    parentDropdown.onChange = function() {
        var isCustom = (this.selection.index === PARENT_PAPER_SIZES.length - 1);
        customParentGroup.visible = isCustom;
        
        if (!isCustom) {
            var size = PARENT_PAPER_SIZES[this.selection.index];
            sharedData.parentSize = {width: size.width, height: size.height};
        }
        updatePreviewInfo();
    };

    // ========== 詳細設定タブの内容 ==========
    // 裁ち落とし（ブリード）設定
    var bleedPanel = advancedTab.add("panel", undefined, "裁ち落とし（ブリード）設定");
    bleedPanel.orientation = "column";
    bleedPanel.alignChildren = "fill";
    bleedPanel.spacing = 5;
    bleedPanel.margins = 8;

    var bleedGroup = bleedPanel.add("group");
    bleedGroup.add("statictext", undefined, "裁ち落とし幅:");
    var bleedInput = bleedGroup.add("edittext", undefined, "3");
    bleedInput.characters = 5;
    bleedGroup.add("statictext", undefined, "mm");
    
    var bleedHint = bleedPanel.add("statictext", undefined, "推奨: 3mm（印刷業界標準）");
    bleedHint.graphics.foregroundColor = bleedHint.graphics.newPen(bleedHint.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);
    
    bleedInput.onChanging = function() {
        this.text = this.text.replace(/[^0-9.]/g, "");
        var value = parseFloat(this.text) || 0;
        if (value > 20) this.text = "20";
        sharedData.bleed = value;
        updatePreviewInfo();
    };

    // ドブ（溝幅）設定
    var gutterPanel = advancedTab.add("panel", undefined, "ドブ（溝幅）設定");
    gutterPanel.orientation = "column";
    gutterPanel.alignChildren = "fill";
    gutterPanel.spacing = 5;
    gutterPanel.margins = 8;

    var gutterGroup = gutterPanel.add("group");
    gutterGroup.add("statictext", undefined, "ドブ幅:");
    var gutterInput = gutterGroup.add("edittext", undefined, "8");
    gutterInput.characters = 5;
    gutterGroup.add("statictext", undefined, "mm");
    
    var gutterHint = gutterPanel.add("statictext", undefined, "推奨: 6-10mm（断裁時の安全マージン）");
    gutterHint.graphics.foregroundColor = gutterHint.graphics.newPen(gutterHint.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);
    
    gutterInput.onChanging = function() {
        this.text = this.text.replace(/[^0-9.]/g, "");
        var value = parseFloat(this.text) || 0;
        if (value > 50) this.text = "50";
        sharedData.gutter = value;
        updatePreviewInfo();
    };

    // 面付け方向・順序
    var orientationPanel = advancedTab.add("panel", undefined, "面付け方向・順序");
    orientationPanel.orientation = "column";
    orientationPanel.alignChildren = "fill";
    orientationPanel.spacing = 5;
    orientationPanel.margins = 8;

    var orientationGroup = orientationPanel.add("group");
    orientationGroup.add("statictext", undefined, "配置順序:");
    var orientationDropdown = orientationGroup.add("dropdownlist");
    orientationDropdown.preferredSize.width = 200;
    
    for (var m = 0; m < IMPOSITION_ORIENTATIONS.length; m++) {
        orientationDropdown.add("item", IMPOSITION_ORIENTATIONS[m].text);
    }
    orientationDropdown.selection = 0; // 標準をデフォルト
    
    orientationDropdown.onChange = function() {
        sharedData.orientation = IMPOSITION_ORIENTATIONS[this.selection.index].direction;
        updatePreviewInfo();
    };

    // 折り加工設定
    var foldingPanel = advancedTab.add("panel", undefined, "折り加工設定");
    foldingPanel.orientation = "column";
    foldingPanel.alignChildren = "fill";
    foldingPanel.spacing = 5;
    foldingPanel.margins = 8;

    var foldingCheck = foldingPanel.add("checkbox", undefined, "折り加工を考慮した配置");
    foldingCheck.value = false;
    
    var foldingTypeGroup = foldingPanel.add("group");
    foldingTypeGroup.add("statictext", undefined, "折り種類:");
    var foldingDropdown = foldingTypeGroup.add("dropdownlist");
    foldingDropdown.preferredSize.width = 150;
    foldingDropdown.enabled = false;
    
    for (var n = 1; n < FOLDING_TYPES.length; n++) { // "なし"以外を追加
        foldingDropdown.add("item", FOLDING_TYPES[n].text);
    }
    foldingDropdown.selection = 0;
    
    foldingCheck.onClick = function() {
        foldingDropdown.enabled = this.value;
        sharedData.folding = this.value ? FOLDING_TYPES[foldingDropdown.selection.index + 1].type : "none";
        updatePreviewInfo();
    };
    
    foldingDropdown.onChange = function() {
        if (foldingCheck.value) {
            sharedData.folding = FOLDING_TYPES[this.selection.index + 1].type;
            updatePreviewInfo();
        }
    };

    // 基本オプション
    var basicOptionsPanel = advancedTab.add("panel", undefined, "基本オプション");
    basicOptionsPanel.orientation = "column";
    basicOptionsPanel.alignChildren = "fill";
    basicOptionsPanel.spacing = 5;
    basicOptionsPanel.margins = 8;

    var centerCheck = basicOptionsPanel.add("checkbox", undefined, "用紙中央に配置");
    centerCheck.value = true;
    var trimMarkCheck = basicOptionsPanel.add("checkbox", undefined, "トンボを追加");
    trimMarkCheck.value = false;
    
    centerCheck.onClick = function() {
        sharedData.centerAlign = this.value;
        updatePreviewInfo();
    };
    
    trimMarkCheck.onClick = function() {
        sharedData.trimMarks = this.value;
        updatePreviewInfo();
    };

    // ========== プレビュータブの内容 ==========
    // ビジュアルプレビューパネル
    var visualPreviewPanel = previewTab.add("panel", undefined, "ビジュアルプレビュー");
    visualPreviewPanel.orientation = "column";
    visualPreviewPanel.alignChildren = "fill";
    visualPreviewPanel.spacing = 5;
    visualPreviewPanel.margins = 8;
    visualPreviewPanel.preferredSize.height = 180;

    // プレビュー描画エリア
    var previewDrawArea = visualPreviewPanel.add("panel");
    previewDrawArea.preferredSize = {width: 460, height: 140};
    
    // プレビュー描画関数
    previewDrawArea.onDraw = function() {
        drawImpositionPreview(this.graphics, sharedData);
    };

    // プレビューコントロール
    var previewControls = visualPreviewPanel.add("group");
    previewControls.orientation = "row";
    previewControls.spacing = 8;
    
    var updatePreviewBtn = previewControls.add("button", undefined, "プレビュー更新");
    updatePreviewBtn.preferredSize.width = 100;
    var showNumbersCheck = previewControls.add("checkbox", undefined, "番号表示");
    showNumbersCheck.value = true;
    var showGutterCheck = previewControls.add("checkbox", undefined, "ドブ表示");
    showGutterCheck.value = true;

    // プレビュー更新イベント
    updatePreviewBtn.onClick = function() {
        updateSharedDataFromUI();
        previewDrawArea.notify("onDraw");
        updatePreviewInfo();
    };
    
    showNumbersCheck.onClick = function() {
        previewDrawArea.notify("onDraw");
    };
    
    showGutterCheck.onClick = function() {
        previewDrawArea.notify("onDraw");
    };

    // 選択オブジェクト分析イベント
    analyzeBtn.onClick = function() {
        analyzeSelectedObjects();
    };

    // 選択オブジェクト分析パネル
    var selectionPanel = previewTab.add("panel", undefined, "選択オブジェクト分析");
    selectionPanel.orientation = "column";
    selectionPanel.alignChildren = "fill";
    selectionPanel.spacing = 5;
    selectionPanel.margins = 8;
    selectionPanel.preferredSize.height = 100;

    var selectionControls = selectionPanel.add("group");
    selectionControls.orientation = "row";
    selectionControls.spacing = 8;
    
    var analyzeBtn = selectionControls.add("button", undefined, "選択オブジェクト分析");
    analyzeBtn.preferredSize.width = 140;
    var autoSuggestCheck = selectionControls.add("checkbox", undefined, "自動提案");
    autoSuggestCheck.value = true;

    var selectionInfo = selectionPanel.add("statictext", undefined, "オブジェクトを選択して「分析」ボタンを押してください", {multiline: true});
    selectionInfo.preferredSize.width = 460;
    selectionInfo.preferredSize.height = 60;

    // 面付け情報表示
    var infoPanel = previewTab.add("panel", undefined, "面付け情報");
    infoPanel.orientation = "column";
    infoPanel.alignChildren = "fill";
    infoPanel.spacing = 5;
    infoPanel.margins = 8;
    infoPanel.preferredSize.height = 80;

    var infoText = infoPanel.add("statictext", undefined, "", {multiline: true});
    infoText.preferredSize.width = 460;
    infoText.preferredSize.height = 60;

    // 用紙効率・警告表示
    var statusPanel = previewTab.add("panel", undefined, "ステータス・警告");
    statusPanel.orientation = "column";
    statusPanel.alignChildren = "fill";
    statusPanel.spacing = 5;
    statusPanel.margins = 8;
    statusPanel.preferredSize.height = 100;

    var statusText = statusPanel.add("statictext", undefined, "", {multiline: true});
    statusText.preferredSize.width = 460;
    statusText.preferredSize.height = 70;

    // 簡易プレビュー（テキストベース）
    var previewPanel = previewTab.add("panel", undefined, "配置プレビュー");
    previewPanel.orientation = "column";
    previewPanel.alignChildren = "fill";
    previewPanel.spacing = 5;
    previewPanel.margins = 8;

    var previewText = previewPanel.add("statictext", undefined, "", {multiline: true});
    previewText.preferredSize.width = 460;
    previewText.preferredSize.height = 80;
    previewText.graphics.font = ScriptUI.newFont("monospace", "Regular", 12);

    // プレビュー更新関数
    function updatePreviewInfo() {
        try {
            // 基本情報
            var info = "【面付け設定】\n";
            info += "• 配置: " + sharedData.preset.rows + "×" + sharedData.preset.cols + "面付け (" + (sharedData.preset.rows * sharedData.preset.cols) + "個)\n";
            info += "• 仕上がり: " + sharedData.finishedSize.width + "×" + sharedData.finishedSize.height + "mm\n";
            info += "• 親紙: " + sharedData.parentSize.width + "×" + sharedData.parentSize.height + "mm\n";
            info += "• 裁ち落とし: " + sharedData.bleed + "mm, ドブ幅: " + sharedData.gutter + "mm";
            infoText.text = info;

            // 用紙効率計算
            var efficiency = calculatePaperEfficiency(sharedData);
            var warnings = validatePrintingStandards(sharedData);
            
            var status = "【用紙効率】" + efficiency + "%";
            if (efficiency >= 80) {
                status += " (優秀)";
            } else if (efficiency >= 70) {
                status += " (良好)";
            } else {
                status += " (要改善)";
            }
            
            if (warnings.length > 0) {
                status += "\n\n【警告】\n• " + warnings.join("\n• ");
            } else {
                status += "\n\n✓ 印刷業界標準に適合しています";
            }
            statusText.text = status;

            // 簡易配置プレビュー
            var preview = generateTextPreview(sharedData);
            previewText.text = preview;
            
        } catch(e) {
            // プレビュー更新エラーは無視
        }
    }

    // 設定保存・復元
    var saveGroup = previewTab.add("group");
    saveGroup.orientation = "row";
    saveGroup.spacing = 10;
    var saveBtn = saveGroup.add("button", undefined, "設定保存");
    var loadBtn = saveGroup.add("button", undefined, "設定復元");
    
    // 設定保存
    saveBtn.onClick = function() {
        try {
            app.preferences.setStringPreference(PREFERENCES_KEY, JSON.stringify(sharedData));
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
                var settings = JSON.parse(savedSettings);
                // 設定を各UIに反映
                sharedData = settings;
                
                // プリセットボタンの更新
                for (var i = 0; i < presetButtons.length; i++) {
                    presetButtons[i].text = presetButtons[i].preset.text;
                    if (!presetButtons[i].preset.custom && 
                        presetButtons[i].preset.rows === settings.preset.rows && 
                        presetButtons[i].preset.cols === settings.preset.cols) {
                        presetButtons[i].text = "● " + presetButtons[i].text;
                        selectedPreset = presetButtons[i];
                    }
                }
                
                // 各種設定の復元
                bleedInput.text = settings.bleed.toString();
                gutterInput.text = settings.gutter.toString();
                centerCheck.value = settings.centerAlign;
                trimMarkCheck.value = settings.trimMarks;
                
                updatePreviewInfo();
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
    buttonGroup.orientation = "row";
    buttonGroup.spacing = 10;
    buttonGroup.alignment = "center";
    
    var executeBtn = buttonGroup.add("button", undefined, "面付け実行");
    executeBtn.preferredSize.width = 120;
    executeBtn.preferredSize.height = 35;
    
    var cancelBtn = buttonGroup.add("button", undefined, "キャンセル");
    cancelBtn.preferredSize.width = 120;
    cancelBtn.preferredSize.height = 35;

    // 実行ボタンの処理
    executeBtn.onClick = function() {
        try {
            // 最終バリデーション
            var warnings = validatePrintingStandards(sharedData);
            if (warnings.length > 0) {
                var warningMsg = "以下の警告があります:\n\n";
                warningMsg += "• " + warnings.join("\n• ");
                warningMsg += "\n\n続行しますか？";
                if (!confirm(warningMsg)) return;
            }
            
            // 確認ダイアログ
            var confirmMsg = "【面付け実行確認】\n";
            confirmMsg += "配置: " + sharedData.preset.rows + "×" + sharedData.preset.cols + "面付け\n";
            confirmMsg += "仕上がり: " + sharedData.finishedSize.width + "×" + sharedData.finishedSize.height + "mm\n";
            confirmMsg += "親紙: " + sharedData.parentSize.width + "×" + sharedData.parentSize.height + "mm\n";
            confirmMsg += "裁ち落とし: " + sharedData.bleed + "mm\n";
            confirmMsg += "ドブ幅: " + sharedData.gutter + "mm\n";
            confirmMsg += "用紙効率: " + calculatePaperEfficiency(sharedData) + "%\n";
            confirmMsg += "\n実行しますか？";
            
            if (confirm(confirmMsg)) {
                dialog.close();
                executeImpositionPro(sharedData);
            }
        } catch(e) {
            alert("エラー: " + e.message);
        }
    };

    cancelBtn.onClick = function() {
        dialog.close();
    };

    // 初期プレビュー更新
    updatePreviewInfo();
    
    // ダイアログ表示
    tabPanel.selection = basicTab; // 基本設定タブをアクティブに
    dialog.show();
    return true; // GUI表示成功
}

// ========== 旧バージョン互換のため executeImposition 関数は残し ==========

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

    // ExtendScript互換のUndo履歴管理
    try {
        // 古い安全な方法: メニューコマンド使用
        app.executeMenuCommand("undo");
        app.executeMenuCommand("redo"); // これでundo履歴に追加される
        
        // 座標系を統一（アートボード基準）
        var prevCS = app.coordinateSystem;
        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
        
        try {
            executeImpositionWithCoordinates(doc, selection, rows, cols, spacing, paperSize, centerAlign, addTrimMarks);
        } finally {
            app.coordinateSystem = prevCS;
        }
        
    } catch(e) {
        var errorMsg = "面付け処理中にエラーが発生しました:\n";
        errorMsg += "エラー内容: " + e.message + "\n\n";
        errorMsg += "解決方法:\n";
        errorMsg += "1. オブジェクトが正しく選択されているか確認\n";
        errorMsg += "2. 用紙サイズ設定を確認\n";
        errorMsg += "3. Ctrl+Zで取り消し可能\n\n";
        errorMsg += "問題が続く場合は開発者にお知らせください♡";
        alert(errorMsg);
        return false;
    }
}

// 座標系統一後のコア処理
function executeImpositionWithCoordinates(doc, selection, rows, cols, spacing, paperSize, centerAlign, addTrimMarks) {
    var totalObjects = rows * cols;
    
    // 選択オブジェクトをグループ化（複数選択対応）
    var originalGroup;
    if (selection.length === 1) {
        originalGroup = selection[0];
    } else {
        originalGroup = doc.groupItems.add();
        for (var i = selection.length - 1; i >= 0; i--) {
            selection[i].move(originalGroup, ElementPlacement.PLACEATBEGINNING);
        }
    }    // アートボード基準のセンタリング計算（座標系統一済み）
    var bounds = originalGroup.geometricBounds; // [left, top, right, bottom]
    var objWidth = Math.abs(bounds[2] - bounds[0]);
    var objHeight = Math.abs(bounds[1] - bounds[3]);
    var spacingPt = spacing * 2.834645669;
    
    // 現在のアートボード取得
    var abIdx = doc.artboards.getActiveArtboardIndex();
    var abRect = doc.artboards[abIdx].artboardRect; // [L,T,R,B]
    var abWidth = abRect[2] - abRect[0];
    var abHeight = abRect[1] - abRect[3]; // top - bottom
    
    var totalWidth = (cols * objWidth) + ((cols - 1) * spacingPt);
    var totalHeight = (rows * objHeight) + ((rows - 1) * spacingPt);
    
    // 用紙サイズチェック（アートボード基準）
    var paperWidthPt = paperSize.width * 2.834645669;
    var paperHeightPt = paperSize.height * 2.834645669;

    if (totalWidth > paperWidthPt || totalHeight > paperHeightPt) {
        var overMsg = "警告: 面付け結果が用紙サイズを超過します。\n";
        overMsg += "必要サイズ: " + Math.round(totalWidth/2.834645669) + "×" + Math.round(totalHeight/2.834645669) + "mm\n";
        overMsg += "用紙サイズ: " + paperSize.width + "×" + paperSize.height + "mm\n";
        overMsg += "\n続行しますか？";
        if (!confirm(overMsg)) return false;
    }

    // 面付け全体の配置開始位置（アートボード中央に配置するか、元位置基準か）
    var startX, startY;
    if (centerAlign) {
        startX = abRect[0] + (abWidth - totalWidth) / 2;
        startY = abRect[1] - (abHeight - totalHeight) / 2; // Y軸方向は上が正
    } else {
        startX = bounds[0];
        startY = bounds[1];
    }

    $.writeln("Grid origin: (" + Math.round(startX) + ", " + Math.round(startY) + ")");

    // 1. 必要数の複製を作成
    var allObjects = [originalGroup]; // 元オブジェクトを含める
    for (var i = 1; i < totalObjects; i++) {
        try {
            var duplicate = originalGroup.duplicate();
            if (duplicate) {
                allObjects.push(duplicate);
            }
        } catch(e) {
            alert("複製エラー（" + i + "個目）: " + e.message);
            break;
        }
    }

    // 2. 全オブジェクトを一時グループに統合
    var tempGroup = doc.groupItems.add();
    for (var j = 0; j < allObjects.length; j++) {
        allObjects[j].move(tempGroup, ElementPlacement.PLACEATBEGINNING);
    }

    // 3. 整列処理で配置（開始位置を渡す）
    if (!distributeObjectsInGrid(tempGroup, rows, cols, spacing, startX, startY)) {
        alert("整列処理でエラーが発生しました");
        return false;
    }

    // 4. 安全なグループ解除
    ungroupSafe(tempGroup);

    // トンボ追加（Illustrator標準機能使用）
    if (addTrimMarks) {
        try {
            // 全体を選択してからトリムマーク実行
            app.executeMenuCommand("selectall");
            app.executeMenuCommand("TrimMark Object");
            doc.selection = null; // 選択解除
            $.writeln("標準トリムマーク機能でトンボを追加しました");
        } catch(trimError) {
            // 標準機能が使えない場合は自前のトンボ作成
            $.writeln("標準トリムマーク機能が使用できません。カスタムトンボを作成します。");
            createProfessionalTrimMarks(doc, paperWidthPt, paperHeightPt);
        }
    }

    var completeMsg = "面付けが完了しました！\n";
    completeMsg += "- " + rows + "行 × " + cols + "列 (" + totalObjects + "個)\n";
    completeMsg += "- 用紙: " + paperSize.width + "×" + paperSize.height + "mm";
    if (addTrimMarks) completeMsg += "\n- トンボ追加済み";
    alert(completeMsg);

    return true; // 処理成功
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
        var regColor;
        try {
            var regSpot = doc.spots.getByName("[Registration]");
            var sc = new SpotColor();
            sc.spot = regSpot;
            sc.tint = 100;
            regColor = sc;
        } catch (e) {
            // フォールバック: 100% K（万一[Registration]が取得できない場合）
            var black = new GrayColor();
            black.gray = 100;
            regColor = black;
        }
        
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
            hLine.strokeColor = regColor;
            hLine.filled = false;
            hLine.move(trimGroup, ElementPlacement.PLACEATBEGINNING);
            
            // 縦線
            var vLine = doc.pathItems.add();
            vLine.setEntirePath([
                [corner.x, corner.y - trimLength], 
                [corner.x, corner.y + trimLength]
            ]);
            vLine.strokeWidth = strokeWidth;
            vLine.strokeColor = regColor;
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
            centerLine.strokeColor = regColor;
            centerLine.filled = false;
            centerLine.move(trimGroup, ElementPlacement.PLACEATBEGINNING);
        }
        
    } catch(e) {
        alert("トンボ作成エラー: " + e.message);
    }
}

// ========== 新しいプロ仕様機能群 ==========

// 用紙効率計算関数
function calculatePaperEfficiency(settings) {
    try {
        var finishedArea = settings.finishedSize.width * settings.finishedSize.height;
        var usedArea = settings.preset.rows * settings.preset.cols * finishedArea;
        var parentArea = settings.parentSize.width * settings.parentSize.height;
        
        return Math.round((usedArea / parentArea) * 100);
    } catch(e) {
        return 0;
    }
}

// 印刷業界標準バリデーション
function validatePrintingStandards(settings) {
    var warnings = [];
    
    try {
        // 裁ち落とし警告
        if (settings.bleed < PRINTING_STANDARDS.minBleed) {
            warnings.push("裁ち落とし幅が" + PRINTING_STANDARDS.minBleed + "mm未満です。印刷仕様を確認してください。");
        }
        
        // ドブ幅警告  
        if (settings.gutter < PRINTING_STANDARDS.minGutter) {
            warnings.push("ドブ幅が" + PRINTING_STANDARDS.minGutter + "mm未満です。断裁時に隣接面に影響する可能性があります。");
        }
        
        // 用紙効率警告
        var efficiency = calculatePaperEfficiency(settings);
        if (efficiency < PRINTING_STANDARDS.minEfficiency) {
            warnings.push("用紙効率が" + efficiency + "%と低めです。面付け方法の見直しを推奨します。");
        }
        
        // サイズ超過チェック
        var totalWidth = (settings.preset.cols * settings.finishedSize.width) + ((settings.preset.cols - 1) * settings.gutter);
        var totalHeight = (settings.preset.rows * settings.finishedSize.height) + ((settings.preset.rows - 1) * settings.gutter);
        
        if (totalWidth > settings.parentSize.width || totalHeight > settings.parentSize.height) {
            warnings.push("面付け結果が親紙サイズを超過します。用紙サイズまたは面付け数を調整してください。");
        }
        
    } catch(e) {
        warnings.push("バリデーション処理でエラーが発生しました。");
    }
    
    return warnings;
}

// テキストベースプレビュー生成
function generateTextPreview(settings) {
    try {
        var preview = "【配置プレビュー】\n";
        
        for (var row = 0; row < settings.preset.rows; row++) {
            var line = "";
            for (var col = 0; col < settings.preset.cols; col++) {
                var pageNum = (row * settings.preset.cols) + col + 1;
                line += "[" + pageNum.toString() + "]";
                if (col < settings.preset.cols - 1) {
                    line += "--"; // ドブを表現
                }
            }
            preview += line + "\n";
            
            if (row < settings.preset.rows - 1) {
                // 行間のドブを表現
                var spacer = "";
                for (var c = 0; c < settings.preset.cols; c++) {
                    spacer += " | ";
                    if (c < settings.preset.cols - 1) {
                        spacer += "  ";
                    }
                }
                preview += spacer + "\n";
            }
        }
        
        preview += "\n配置方向: " + getOrientationDescription(settings.orientation);
        if (settings.folding !== "none") {
            preview += "\n折り加工: " + getFoldingDescription(settings.folding);
        }
        
        return preview;
    } catch(e) {
        return "プレビュー生成エラー";
    }
}

// 方向説明取得
function getOrientationDescription(direction) {
    for (var i = 0; i < IMPOSITION_ORIENTATIONS.length; i++) {
        if (IMPOSITION_ORIENTATIONS[i].direction === direction) {
            return IMPOSITION_ORIENTATIONS[i].text;
        }
    }
    return "標準";
}

// 折り説明取得
function getFoldingDescription(foldType) {
    for (var i = 0; i < FOLDING_TYPES.length; i++) {
        if (FOLDING_TYPES[i].type === foldType) {
            return FOLDING_TYPES[i].text;
        }
    }
    return "なし";
}

// プロ仕様面付け実行関数
function executeImpositionPro(settings) {
    try {
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

        // 新しい設定形式で面付け実行
        executeImposition(
            settings.preset.rows, 
            settings.preset.cols, 
            settings.gutter, 
            settings.parentSize, 
            settings.centerAlign, 
            settings.trimMarks
        );
        
    } catch(e) {
        alert("面付け実行エラー: " + e.message);
    }
}

// メイン実行関数
function main() {
    try {
        if (!app.activeDocument) {
            alert("Illustratorでドキュメントを開いてからスクリプトを実行してください。");
            return "ドキュメントが開かれていません";
        } else {
            createImpositionGUI();
            return "面付けツールを起動しました";
        }
    } catch(e) {
        alert("スクリプト起動エラー: " + e.message);
        return "エラー: " + e.message;
    }
}

// 安全なグループ解除関数
function ungroupSafe(groupItem) {
    try {
        if (!groupItem || groupItem.typename !== "GroupItem") {
            $.writeln("警告: 無効なグループアイテムです");
            return false;
        }
        
        var parent = groupItem.parent;
        var items = [];
        
        // 逆順でアイテムを取得（安全性向上）
        for (var i = groupItem.pageItems.length - 1; i >= 0; i--) {
            items.push(groupItem.pageItems[i]);
        }
        
        // 各アイテムを親に移動
        for (var j = 0; j < items.length; j++) {
            items[j].move(parent, ElementPlacement.PLACEATBEGINNING);
        }
        
        // 空になったグループを削除
        groupItem.remove();
        $.writeln("グループ解除完了: " + items.length + "個のアイテムを移動");
        return true;
        
    } catch(e) {
        alert("グループ解除エラー: " + e.message);
        return false;
    }
}

// 新しい整列ベースの面付け関数（リファクタリング版）
function distributeObjectsInGrid(groupOrArray, rows, cols, spacingMM, startLeft, startTop) {
    try {
        var spacingPt = spacingMM * 2.834645669; // mm to point
        
        // グループの場合はpageItemsから取得、配列の場合はそのまま使用
        var allObjects;
        if (groupOrArray.typename === "GroupItem") {
            allObjects = [];
            for (var i = 0; i < groupOrArray.pageItems.length; i++) {
                allObjects.push(groupOrArray.pageItems[i]);
            }
        } else if (groupOrArray.length !== undefined) {
            allObjects = groupOrArray;
        } else {
            alert("無効なオブジェクト型です");
            return false;
        }
        
        if (!allObjects || allObjects.length === 0) {
            alert("整列対象のオブジェクトがありません");
            return false;
        }
        
        // オブジェクトサイズ取得（最初のオブジェクトベース）
        var firstBounds = allObjects[0].geometricBounds;
        var objWidth = Math.abs(firstBounds[2] - firstBounds[0]);
        var objHeight = Math.abs(firstBounds[1] - firstBounds[3]);
        
        // 基準位置（指定があればそれを使用、なければ最初のオブジェクト位置）
        var originLeft = (startLeft !== undefined) ? startLeft : firstBounds[0];
        var originTop = (startTop !== undefined) ? startTop : firstBounds[1];
        
        // グリッド配置実行（最初のオブジェクトも含めて移動）
        var objIndex = 0;
        for (var row = 0; row < rows && objIndex < allObjects.length; row++) {
            for (var col = 0; col < cols && objIndex < allObjects.length; col++) {
                var targetX = originLeft + (col * (objWidth + spacingPt));
                var targetY = originTop - (row * (objHeight + spacingPt));
                var currentBounds = allObjects[objIndex].geometricBounds;
                var deltaX = targetX - currentBounds[0];
                var deltaY = targetY - currentBounds[1];
                allObjects[objIndex].translate(deltaX, deltaY);
                objIndex++;
            }
        }
        
        return true;
    } catch(e) {
        alert("整列エラー: " + e.message);
        return false;
    }
}

// ========== プレビュー描画関数 ==========
// プレビュー描画メイン関数
function drawImpositionPreview(graphics, data) {
    if (!graphics || !data) return;

    var g = graphics;
    var padding = 20;
    var drawWidth = 420; // 描画エリア幅
    var drawHeight = 100; // 描画エリア高さ
    
    // 背景クリア
    var bgBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.95, 0.95, 0.95]);
    g.newPath();
    g.rectPath(0, 0, drawWidth + padding * 2, drawHeight + padding * 2);
    g.fillPath(bgBrush);

    // 親紙サイズの計算（スケール調整）
    var parentW = data.parentSize.width;
    var parentH = data.parentSize.height;
    var scale = Math.min((drawWidth - padding * 2) / parentW, (drawHeight - padding * 2) / parentH);
    
    var scaledParentW = parentW * scale;
    var scaledParentH = parentH * scale;
    var offsetX = padding + (drawWidth - scaledParentW) / 2;
    var offsetY = padding + (drawHeight - scaledParentH) / 2;

    // 親紙枠描画（青色）
    var parentPen = g.newPen(g.PenType.SOLID_COLOR, [0, 0.3, 0.8], 2);
    g.newPath();
    g.rectPath(offsetX, offsetY, scaledParentW, scaledParentH);
    g.strokePath(parentPen);

    // 面付けページ描画
    drawImpositionPages(g, data, offsetX, offsetY, scale);
    
    // ドブ描画
    if (data.gutter > 0) {
        drawGutterLines(g, data, offsetX, offsetY, scale);
    }
}

// 面付けページ描画
function drawImpositionPages(graphics, data, offsetX, offsetY, scale) {
    var g = graphics;
    var preset = data.preset;
    var pageW = (data.finishedSize.width + data.bleed * 2) * scale;
    var pageH = (data.finishedSize.height + data.bleed * 2) * scale;
    var gutterW = data.gutter * scale;

    // ページ配置計算
    var totalW = preset.cols * pageW + (preset.cols - 1) * gutterW;
    var totalH = preset.rows * pageH + (preset.rows - 1) * gutterW;
    var startX = offsetX + (data.parentSize.width * scale - totalW) / 2;
    var startY = offsetY + (data.parentSize.height * scale - totalH) / 2;

    // ページ枠描画（緑色）
    var pagePen = g.newPen(g.PenType.SOLID_COLOR, [0, 0.6, 0.2], 1);
    var pageBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.9, 1, 0.9, 0.3]);

    for (var row = 0; row < preset.rows; row++) {
        for (var col = 0; col < preset.cols; col++) {
            var x = startX + col * (pageW + gutterW);
            var y = startY + row * (pageH + gutterW);
            
            g.newPath();
            g.rectPath(x, y, pageW, pageH);
            g.fillPath(pageBrush);
            g.strokePath(pagePen);
            
            // ページ番号表示（円で代用）
            drawPageNumber(g, col + row * preset.cols + 1, x + pageW/2, y + pageH/2);
        }
    }
}

// ドブライン描画
function drawGutterLines(graphics, data, offsetX, offsetY, scale) {
    var g = graphics;
    var preset = data.preset;
    var pageW = (data.finishedSize.width + data.bleed * 2) * scale;
    var pageH = (data.finishedSize.height + data.bleed * 2) * scale;
    var gutterW = data.gutter * scale;

    var totalW = preset.cols * pageW + (preset.cols - 1) * gutterW;
    var totalH = preset.rows * pageH + (preset.rows - 1) * gutterW;
    var startX = offsetX + (data.parentSize.width * scale - totalW) / 2;
    var startY = offsetY + (data.parentSize.height * scale - totalH) / 2;

    // ドブライン（赤色点線）
    var gutterPen = g.newPen(g.PenType.SOLID_COLOR, [0.8, 0.2, 0.2], 1);
    
    // 縦ドブライン
    for (var col = 1; col < preset.cols; col++) {
        var x = startX + col * pageW + (col - 0.5) * gutterW;
        g.newPath();
        g.moveTo(x, startY);
        g.lineTo(x, startY + totalH);
        g.strokePath(gutterPen);
    }
    
    // 横ドブライン
    for (var row = 1; row < preset.rows; row++) {
        var y = startY + row * pageH + (row - 0.5) * gutterW;
        g.newPath();
        g.moveTo(startX, y);
        g.lineTo(startX + totalW, y);
        g.strokePath(gutterPen);
    }
}

// ページ番号表示（円で代用）
function drawPageNumber(graphics, pageNum, centerX, centerY) {
    var g = graphics;
    var textBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.2, 0.2]);
    // ExtendScriptのScriptUIではテキスト描画が制限的なので円で代用
    g.newPath();
    g.ellipsePath(centerX - 8, centerY - 8, 16, 16);
    g.fillPath(textBrush);
}

// UIからsharedDataを更新
function updateSharedDataFromUI() {
    // 基本設定タブの値を反映
    // (実際の実装では各UIコントロールからの値取得が必要)
    // この関数は各タブのonChangeイベントから呼び出される想定
    
    // プレビュー情報テキストも更新
    updatePreviewInfo();
}

// プレビュー情報テキスト更新
function updatePreviewInfo() {
    if (typeof infoText !== 'undefined') {
        var info = "面付け設定: " + sharedData.preset.rows + "×" + sharedData.preset.cols + "面付け\n";
        info += "仕上がりサイズ: " + sharedData.finishedSize.width + "×" + sharedData.finishedSize.height + "mm\n";
        info += "親紙サイズ: " + sharedData.parentSize.width + "×" + sharedData.parentSize.height + "mm\n";
        info += "ドブ: " + sharedData.gutter + "mm, 塗り足し: " + sharedData.bleed + "mm";
        
        infoText.text = info;
    }
}

// ========== 選択オブジェクト分析機能 ==========
// 選択オブジェクトの分析メイン関数
function analyzeSelectedObjects() {
    try {
        if (!app.activeDocument) {
            alert("アクティブなドキュメントがありません。");
            return;
        }

        var doc = app.activeDocument;
        var selection = doc.selection;
        
        if (selection.length === 0) {
            updateSelectionInfo("オブジェクトが選択されていません。\nオブジェクトを選択してから分析してください。");
            return;
        }

        // 選択オブジェクトのバウンディングボックス取得
        var bounds = getSelectionBounds(selection);
        if (!bounds) {
            updateSelectionInfo("選択オブジェクトのサイズを取得できませんでした。");
            return;
        }

        // サイズ情報を計算（ポイントからmm変換）
        var objectSize = {
            width: Math.round((bounds.width / 2.834645669) * 10) / 10,  // pt to mm
            height: Math.round((bounds.height / 2.834645669) * 10) / 10
        };

        // 面付け提案を計算
        var suggestions = calculateImpositionSuggestions(objectSize);
        
        // 結果表示
        displayAnalysisResults(objectSize, suggestions);
        
        // 自動提案が有効な場合、最適な設定を適用
        if (autoSuggestCheck.value && suggestions.length > 0) {
            applyBestSuggestion(suggestions[0]);
        }

    } catch(e) {
        alert("分析エラー: " + e.message);
    }
}

// 選択オブジェクトのバウンディングボックス取得
function getSelectionBounds(selection) {
    try {
        var minX = Infinity, minY = Infinity;
        var maxX = -Infinity, maxY = -Infinity;
        
        for (var i = 0; i < selection.length; i++) {
            var item = selection[i];
            var bounds = item.visibleBounds; // [left, top, right, bottom]
            
            minX = Math.min(minX, bounds[0]);
            maxX = Math.max(maxX, bounds[2]);
            minY = Math.min(minY, bounds[3]);
            maxY = Math.max(maxY, bounds[1]);
        }
        
        return {
            left: minX,
            top: maxY,
            right: maxX,
            bottom: minY,
            width: maxX - minX,
            height: maxY - minY
        };
        
    } catch(e) {
        return null;
    }
}

// 面付け提案計算
function calculateImpositionSuggestions(objectSize) {
    var suggestions = [];
    var targetWidth = objectSize.width + (sharedData.bleed * 2);
    var targetHeight = objectSize.height + (sharedData.bleed * 2);
    
    // 標準用紙サイズでの面付け計算
    var paperSizes = [
        {name: "A3", width: 297, height: 420},
        {name: "A4", width: 210, height: 297},
        {name: "B4", width: 257, height: 364},
        {name: "B5", width: 182, height: 257},
        {name: "A2", width: 420, height: 594},
        {name: "B3", width: 364, height: 515}
    ];
    
    for (var p = 0; p < paperSizes.length; p++) {
        var paper = paperSizes[p];
        
        // 縦横両方向で計算
        var arrangements = [
            calculateArrangement(targetWidth, targetHeight, paper.width, paper.height),
            calculateArrangement(targetHeight, targetWidth, paper.width, paper.height)
        ];
        
        for (var a = 0; a < arrangements.length; a++) {
            var arr = arrangements[a];
            if (arr.count > 0) {
                var efficiency = (arr.count * targetWidth * targetHeight) / (paper.width * paper.height);
                suggestions.push({
                    paperName: paper.name,
                    paperSize: {width: paper.width, height: paper.height},
                    objectSize: objectSize,
                    arrangement: arr,
                    efficiency: Math.round(efficiency * 1000) / 10, // %表示
                    totalPages: arr.count,
                    rotation: a === 1 ? 90 : 0
                });
            }
        }
    }
    
    // 効率順でソート
    suggestions.sort(function(a, b) { return b.efficiency - a.efficiency; });
    
    return suggestions.slice(0, 5); // 上位5件
}

// 配置計算
function calculateArrangement(itemW, itemH, paperW, paperH) {
    var gutterW = sharedData.gutter;
    
    // マージンを考慮（最低10mm）
    var margin = 10;
    var usableW = paperW - (margin * 2);
    var usableH = paperH - (margin * 2);
    
    if (itemW > usableW || itemH > usableH) {
        return {rows: 0, cols: 0, count: 0};
    }
    
    // 横方向の配置数
    var cols = Math.floor((usableW + gutterW) / (itemW + gutterW));
    // 縦方向の配置数
    var rows = Math.floor((usableH + gutterW) / (itemH + gutterW));
    
    return {
        rows: rows,
        cols: cols,
        count: rows * cols
    };
}

// 分析結果表示
function displayAnalysisResults(objectSize, suggestions) {
    var result = "選択オブジェクト: " + objectSize.width + "×" + objectSize.height + "mm\n";
    result += "塗り足し込み: " + (objectSize.width + sharedData.bleed * 2) + "×" + (objectSize.height + sharedData.bleed * 2) + "mm\n\n";
    
    if (suggestions.length > 0) {
        result += "【面付け提案 TOP3】\n";
        for (var i = 0; i < Math.min(3, suggestions.length); i++) {
            var s = suggestions[i];
            result += (i + 1) + ". " + s.paperName + "紙: " + s.totalPages + "面付け (" + s.arrangement.rows + "×" + s.arrangement.cols + ") ";
            result += "効率" + s.efficiency + "%";
            if (s.rotation > 0) result += " [90°回転]";
            result += "\n";
        }
    } else {
        result += "適切な面付けが見つかりませんでした。\nオブジェクトサイズを確認してください。";
    }
    
    updateSelectionInfo(result);
}

// 最適提案の適用
function applyBestSuggestion(suggestion) {
    if (!suggestion) return;
    
    // sharedDataに最適設定を適用
    sharedData.preset = {
        rows: suggestion.arrangement.rows,
        cols: suggestion.arrangement.cols
    };
    sharedData.parentSize = suggestion.paperSize;
    sharedData.finishedSize = suggestion.objectSize;
    
    // プレビュー更新
    previewDrawArea.notify("onDraw");
    updatePreviewInfo();
}

// 選択分析情報更新
function updateSelectionInfo(text) {
    if (typeof selectionInfo !== 'undefined') {
        selectionInfo.text = text;
    }
}

// スクリプト実行
main();
