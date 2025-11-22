# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TW Scoring is an Electron-based desktop application for managing and scoring freestyle skiing and ski racing competitions. It provides real-time scoring, judge terminal integration, protocol generation, and timing device support.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Build without packaging
npm run build:dir

# Clean build files
npm run build:clean
```

Note: This project uses `NODE_OPTIONS=--openssl-legacy-provider` due to webpack compatibility requirements.

## Architecture

### Technology Stack
- **Electron 2.0.18** - Desktop application framework
- **Vue.js 2.7.14** - Frontend framework
- **Vuetify 2.6.12** - Material Design UI components
- **Vuex 3.6.2** - State management
- **Socket.IO 3.1.2** - Real-time communication
- **Express 4.18.2** - Backend server
- **Webpack 4.46.0** - Module bundler

### Project Structure
```
src/
├── main/                     # Electron main process
│   ├── index.js             # Entry point, IPC handlers
│   ├── socket_setup.js      # WebSocket server
│   ├── TCPServer/           # Judge terminal TCP server
│   ├── timingServer/        # Timing device integration
│   └── lic_server.js        # License validation
│
└── renderer/                 # Vue.js frontend
    ├── components/          # Vue components organized by feature
    ├── store/              # Vuex modules
    ├── classes/            # Domain object classes
    ├── router/             # Vue Router configuration
    └── utils/              # Utility functions
```

### Key Architectural Patterns

1. **Multi-Process Architecture**
   - Main process handles system operations, file I/O, and servers
   - Renderer process runs the Vue.js application
   - IPC communication between processes

2. **Real-time Communication**
   - Socket.IO server on port 8080 for client synchronization
   - TCP server for judge terminal connections
   - Event-driven message passing

3. **State Management**
   - Modular Vuex store with domain-specific modules
   - Centralized state for competition data
   - Real-time state synchronization via WebSocket

4. **Data Persistence**
   - JSON file storage in `events/` directory
   - Auto-save functionality
   - Import/export support (Excel, CSV, XML)

## Important Implementation Details

### Competition Disciplines
The app supports multiple skiing disciplines, each with specific scoring logic:
- **Aerials** - Jump codes and technical scoring
- **Moguls** - Technical turns and air scoring
- **Ski Cross** - Heat-based elimination racing
- **Dual Moguls** - Head-to-head mogul competitions

### Judge Terminal Integration
- TCP server accepts connections from physical judge terminals
- Custom protocol for score transmission
- Terminal state monitoring and management

### Protocol Generation
- Custom protocol builder for creating competition documents
- PDF generation via html2pdf.js
- Template system for reusable layouts
- Export to PDF, Excel, CSV, and FIS XML formats

### Timing Integration
- TCP server for timing device connections
- Support for various timing device protocols
- Manual time entry backup

## Development Guidelines

### Component Conventions
- Use single-file Vue components (.vue)
- Follow existing naming patterns (kebab-case for files, PascalCase for components)
- Place components in feature-specific directories

### State Management
- Use Vuex mutations for all state changes
- Keep business logic in domain classes (EventClass, CompetitorClass, etc.)
- Use getters for computed state values

### Styling
- Use Vuetify components where possible
- Custom styles in SCSS following existing patterns
- Theme variables defined in theme.css

### Error Handling
- Console methods are overridden in logger-override.js
- Use try-catch blocks for critical operations
- Display user-friendly error messages via the message system

## Common Tasks

### Adding a New Competition Type
1. Create a new Vuex module in `store/modules/`
2. Add discipline-specific components in `components/scoring/`
3. Update calculation helpers in `utils/discipline-specific-calculation-helpers.js`
4. Add protocol templates if needed

### Modifying Judge Terminal Protocol
1. Update handlers in `main/TCPServer/terminalTCPMessageHandlers.js`
2. Modify message transmitters in `terminalTCPMessageTransmitters.js`
3. Update terminal UI components in `components/scoring/scoresPanel/`

### Working with Protocols
1. Protocol structure defined in `classes/Protocol/` classes
2. Protocol handlers in `protocolHandlers/` for data processing
3. Protocol builder UI in `components/protocol/protocolBuilder/`

## Security Considerations
- License validation through system hardware binding
- No hardcoded credentials in the codebase
- File-based configuration for sensitive settings