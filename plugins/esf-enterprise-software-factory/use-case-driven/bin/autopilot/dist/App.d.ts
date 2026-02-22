import type { AutopilotConfig } from './types/config.js';
/**
 * Props for App component
 */
export interface AppProps {
    config: AutopilotConfig;
}
/**
 * Main App component - uses existing AutopilotProvider from parent
 * Note: AutopilotProvider is created in index.tsx, not here
 */
export declare function App({ config }: AppProps): import("react/jsx-runtime").JSX.Element;
export default App;
//# sourceMappingURL=App.d.ts.map