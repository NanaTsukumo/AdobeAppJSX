# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AdobeAppJSX** is an AI-powered ExtendScript automation collection for Adobe Creative Suite, focusing on practical workflow optimization. This is an alpha-stage project using AI collaborative development methodologies.

### Core Purpose
- **Community Contribution**: Efficiency tools for Adobe Creative Cloud users
- **Practical Focus**: Production-ready automation scripts for real-world workflows
- **AI Collaboration**: Leveraging multiple AI technologies for development process
- **Knowledge Sharing**: ExtendScript/UXP best practices and implementation patterns

## Project Structure

```
├── illustrator Scripts/          # ExtendScript (.jsx) automation files
├── SystemPrompts/               # AI system prompt configurations
│   ├── Adobe/                  # Adobe-specific technical knowledge
│   ├── Character/              # Luna persona configuration
│   └── Context/               # Work environment context
├── References/                 # Adobe JSX documentation and guides
├── .vscode/                   # VS Code configuration with JSX snippets
└── .github/copilot-instructions.md # GitHub Copilot integration
```

### Key Components
- **Auto-imposition Script** (`auto-imposition.jsx`): Multi-row/column layout automation with progress tracking
- **Layer Organizer** (`layer-organizer.jsx`): Layer management and organization utilities
- **VS Code Integration**: Specialized workspace with ExtendScript debugging support
- **Reference System**: Comprehensive Adobe API documentation and code patterns

## Development Commands

### VS Code Tasks
- **`Ctrl+Shift+P` → "Tasks: Run Task"** → Available tasks:
  - `📋 JSX Development Checklist` - Open development reference guide
  - `🔗 Open Adobe Documentation` - Open Adobe JSX API documentation
  - `🚀 Create New JSX Script` - Create new script with template

### ExtendScript Execution
- **Debug Mode**: `F5` (requires ExtendScript Debugger extension)
- **Manual Execution**: Adobe app → File → Scripts → Other Script → Select .jsx file

### Required Extensions
- `ExtendScript Debugger` - Adobe script debugging support
- `GitHub Copilot` + `GitHub Copilot Chat` - AI assistance (configured with Luna persona)
- `Prettier` - Code formatting

## Architecture & Design Patterns

### ExtendScript Code Standards
- **Safety First**: All scripts include undo functionality and confirmation dialogs
- **Error Handling**: Comprehensive try-catch blocks with Japanese UI messages
- **Progress Feedback**: ScriptUI progress bars for batch operations
- **Settings Persistence**: User preferences saved between sessions
- **Modular Design**: Function separation for maintainability

### Required Script Elements
Every .jsx script MUST include:
- Document existence verification
- Error handling with try-catch
- Undo functionality implementation
- Progress bar for batch processing
- Japanese UI messages
- Reference to appropriate documentation in comments

### Code Template Usage
- Use VS Code snippets: `jsx-basic`, `jsx-dialog`, `jsx-batch`
- Templates automatically include safety checks and reference links
- All templates follow the mandatory development checklist

## AI Collaboration Framework

### Character Integration
- **Luna Persona**: Technical assistant with mesugaki character traits
- **Communication Style**: Friendly Japanese with technical accuracy
- **User Address**: Always "お兄さん" (oniisan)
- **Critical Thinking**: Must provide counterarguments/alternative perspectives

### Development Workflow
1. **Pre-Development**: Check `References/Adobe-JSX-Documentation-Index.md`
2. **Template Usage**: Use VS Code snippets with auto-included references
3. **Code Review**: Verify against development checklist
4. **Documentation Update**: Update References if new patterns discovered

### Multi-AI Coordination
- **GitHub Copilot**: Code completion and snippet generation
- **Claude Code**: Architecture design and implementation review
- **Task Distribution**: Clear role separation with formal handoff protocols

## Technical Requirements

### Environment Setup
- **Adobe Creative Cloud 2020+** (Illustrator primary, Photoshop/InDesign planned)
- **VS Code** with `adobe-jsx-workspace.code-workspace`
- **ExtendScript Debugger** extension
- **Windows 10/11 or macOS 10.15+**

### Key Technologies
- **ExtendScript** (.jsx) - Adobe automation scripting
- **ScriptUI** - User interface creation
- **Adobe Object Model** - Creative Suite API integration

## Development Guidelines

### File Naming Conventions
- Use descriptive Japanese names for user-facing scripts (e.g., `自動面付け.jsx`)
- Internal files use English (e.g., `auto-imposition.jsx` for development)
- No spaces in technical file paths, use hyphens

### Performance Considerations
- **Batch Processing**: Designed for large document sets
- **Memory Management**: Proper cleanup of Adobe objects
- **User Experience**: Non-blocking operations with progress feedback
- **Safety Limits**: Maximum values to prevent system overload

### Quality Assurance
- **Manual Testing**: Real-world validation with Adobe applications
- **Error Recovery**: Graceful failure handling with state restoration
- **User Documentation**: Japanese UI with clear error messages

## Reference System

### Documentation Hierarchy
1. `References/Adobe-JSX-Documentation-Index.md` - Master documentation index
2. `References/Quick-Reference-JSX-Snippets.md` - Code patterns and examples
3. `SystemPrompts/Adobe/technical-reference.md` - API usage patterns
4. Application-specific guides for Workspace switching and settings

### Mandatory Reference Practice
- Always consult documentation before implementing new features
- Update reference materials when discovering new patterns
- Include documentation links in script comments
- Validate against latest Adobe API changes

This project emphasizes practical automation solutions with strong emphasis on user safety, work environment improvement, and collaborative AI development practices.