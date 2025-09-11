# Adobe JSX 開発用クイックリファレンス

## 🔖 **よく使用するコードスニペット**

### **基本的なスクリプト構造**
```javascript
// ドキュメント存在確認
if (app.documents.length === 0) {
    alert("ドキュメントを開いてください。");
    exit();
}

var doc = app.activeDocument;

// エラーハンドリング
try {
    // メイン処理
    processDocument(doc);
} catch (e) {
    alert("エラーが発生しました: " + e.toString());
}

function processDocument(document) {
    // 実際の処理内容
}
```

### **ScriptUI 基本ダイアログ**
```javascript
function createDialog() {
    var dialog = new Window("dialog", "設定");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    
    // テキスト入力
    var textGroup = dialog.add("group");
    textGroup.add("statictext", undefined, "テキスト:");
    var textInput = textGroup.add("edittext", undefined, "デフォルト値");
    textInput.preferredSize.width = 200;
    
    // ボタン群
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "キャンセル");
    
    // イベント
    okButton.onClick = function() {
        dialog.close(1);
    };
    cancelButton.onClick = function() {
        dialog.close(0);
    };
    
    if (dialog.show() === 1) {
        return textInput.text;
    }
    return null;
}
```

### **オブジェクト選択・操作**
```javascript
// すべてのオブジェクトを選択解除
app.activeDocument.selection = [];

// 特定タイプのオブジェクトを選択
var textItems = doc.textFrames;
for (var i = 0; i < textItems.length; i++) {
    if (textItems[i].contents.indexOf("検索文字") >= 0) {
        textItems[i].selected = true;
    }
}

// レイヤー操作
var layer = doc.layers.add();
layer.name = "新しいレイヤー";
layer.color = RGBColor();
layer.color.red = 255;
layer.color.green = 0;
layer.color.blue = 0;
```

### **座標・サイズ計算**
```javascript
// アートボードサイズ取得
var artboard = doc.artboards[0];
var rect = artboard.artboardRect; // [left, top, right, bottom]
var width = rect[2] - rect[0];
var height = rect[1] - rect[3];

// オブジェクト中央配置
function centerObject(obj, artboardRect) {
    var objRect = obj.geometricBounds;
    var objWidth = objRect[2] - objRect[0];
    var objHeight = objRect[1] - objRect[3];
    
    var centerX = (artboardRect[0] + artboardRect[2]) / 2;
    var centerY = (artboardRect[1] + artboardRect[3]) / 2;
    
    obj.position = [
        centerX - objWidth / 2,
        centerY + objHeight / 2
    ];
}
```

---

## 📋 **頻繁に使用するメソッド・プロパティ**

### **Document オブジェクト**
- `app.documents.add()` - 新規ドキュメント作成
- `doc.artboards` - アートボード配列
- `doc.layers` - レイヤー配列
- `doc.textFrames` - テキストフレーム配列
- `doc.pathItems` - パスアイテム配列
- `doc.selection` - 選択オブジェクト配列

### **File 操作**
- `File.openDialog()` - ファイル選択ダイアログ
- `Folder.selectDialog()` - フォルダ選択ダイアログ
- `file.open("r")` - ファイル読み込み
- `file.writeln(text)` - ファイル書き込み
- `file.close()` - ファイルクローズ

### **エクスポート**
- `doc.exportFile(file, ExportType.PNG24)` - PNG エクスポート
- `doc.exportFile(file, ExportType.JPEG)` - JPEG エクスポート
- `doc.saveAs(file)` - AI ファイル保存

---

## ⚡ **デバッグ・テスト用コード**

### **オブジェクト情報表示**
```javascript
function debugObjectInfo(obj) {
    var info = [];
    info.push("Type: " + obj.typename);
    info.push("Position: " + obj.position);
    info.push("Size: " + obj.width + " x " + obj.height);
    
    if (obj.typename === "TextFrame") {
        info.push("Text: " + obj.contents);
    }
    
    alert(info.join("\n"));
}
```

### **処理時間測定**
```javascript
function measureTime(func, args) {
    var startTime = new Date().getTime();
    var result = func.apply(null, args);
    var endTime = new Date().getTime();
    
    alert("処理時間: " + (endTime - startTime) + "ms");
    return result;
}
```

### **プログレスバー**
```javascript
function createProgressBar(maxValue) {
    var progressWin = new Window("palette", "処理中...");
    progressWin.orientation = "column";
    progressWin.alignChildren = "fill";
    
    var progressBar = progressWin.add("progressbar", undefined, 0, maxValue);
    progressBar.preferredSize.width = 300;
    
    var statusText = progressWin.add("statictext", undefined, "準備中...");
    
    progressWin.show();
    
    return {
        window: progressWin,
        bar: progressBar,
        text: statusText,
        update: function(value, message) {
            this.bar.value = value;
            this.text.text = message || "";
            app.redraw();
        },
        close: function() {
            this.window.close();
        }
    };
}
```

---

## 🎯 **よくあるエラーと対処法**

### **エラーパターン**
1. **"オブジェクトが見つかりません"**
   - 原因: 削除済みオブジェクトへの参照
   - 対処: 存在確認後にアクセス

2. **"ファイルが開けません"**
   - 原因: パス指定エラー、権限不足
   - 対処: パス確認、try-catch で処理

3. **"メモリ不足"**
   - 原因: 大量オブジェクト処理
   - 対処: バッチ処理、定期的なガベージコレクション

### **安全なコーディングパターン**
```javascript
// オブジェクト存在確認
if (obj && obj.typename) {
    // 処理実行
}

// 配列処理（逆順で削除）
for (var i = items.length - 1; i >= 0; i--) {
    if (shouldDelete(items[i])) {
        items[i].remove();
    }
}

// リソース確実解放
try {
    var file = File(path);
    file.open("r");
    // ファイル操作
} finally {
    if (file) file.close();
}
```

---

**このクイックリファレンスで、日常的な JSX 開発がより効率的に ♡**