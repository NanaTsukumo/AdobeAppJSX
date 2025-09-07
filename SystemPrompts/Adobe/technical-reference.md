# Adobe ExtendScript Technical Reference

## Core APIs and Objects

### Illustrator Object Model
```javascript
// Document management
app.activeDocument
app.documents.add()
app.open(file)

// Selection and objects
doc.selection
doc.pathItems
doc.textFrames
doc.groupItems
doc.artboards

// Geometry and positioning
item.geometricBounds // [top, left, bottom, right]
item.position // [x, y]
item.translate(deltaX, deltaY)
item.resize(scaleX, scaleY)
```

### Common Patterns

#### Object Duplication and Positioning
```javascript
// Safe duplication with positioning
var originalBounds = originalItem.geometricBounds;
var duplicate = originalItem.duplicate();
var offsetX = 100; // points
var offsetY = -50; // points
duplicate.translate(offsetX, offsetY);
```

#### Unit Conversion
```javascript
// mm to points conversion (1mm = 2.834645669 points)
function mmToPoints(mm) {
    return mm * 2.834645669;
}

// Points to mm conversion
function pointsToMm(points) {
    return points / 2.834645669;
}
```

#### Error Handling Template
```javascript
try {
    if (!app.activeDocument) {
        throw new Error("アクティブなドキュメントがありません");
    }
    
    // Main processing logic here
    
} catch (error) {
    alert("エラーが発生しました: " + error.message);
    return false;
}
```

### ScriptUI Dialog Components
```javascript
// Basic dialog structure
var dialog = new Window("dialog", "Dialog Title");
dialog.orientation = "column";
dialog.alignChildren = ["left", "top"];
dialog.spacing = 10;
dialog.margins = 16;

// Panel grouping
var panel = dialog.add("panel", undefined, "Panel Title");
panel.orientation = "column";
panel.alignChildren = "left";

// Input controls
var editText = panel.add("edittext", undefined, "default value");
editText.characters = 10;

var dropdown = panel.add("dropdownlist", undefined, ["Option 1", "Option 2"]);
dropdown.selection = 0;

var checkbox = panel.add("checkbox", undefined, "Check this");
checkbox.value = true;
```

## Performance Optimization

### Memory Management
- Use `duplicate()` instead of copy/paste operations
- Clean up temporary objects when possible
- Avoid creating excessive undo states

### Batch Operations
- Group multiple operations within single undo state
- Use progress bars for long operations
- Process in chunks for large datasets

## Best Practices

### Code Organization
1. Separate UI creation from business logic
2. Use meaningful function and variable names
3. Add comprehensive error checking
4. Include usage examples in comments

### User Experience
1. Validate inputs before processing
2. Provide clear progress indication
3. Include cancel functionality
4. Show meaningful success/error messages
