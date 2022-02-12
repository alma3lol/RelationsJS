import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
import './i18nextConf';
import { useEffect, useState, createContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Driver } from 'neo4j-driver';
import { createTheme, ThemeProvider, Theme, ThemeOptions } from '@mui/material/styles';
import Sigma from 'sigma';
import { SnackbarProvider } from 'notistack';
import { SigmaContainer } from 'react-sigma-v2';
import 'react-sigma-v2/lib/react-sigma-v2.css';
import getNodeProgramImage from 'sigma/rendering/webgl/programs/node.image';
import { AuthRoute, RestrictedRoute } from './components';
import { DashboardView, ListView, LoginView, PersonPrint, PersonEdit } from './views';
import { RTL } from './rtl-support';
import { Neo4jSigmaGraph } from './neo4j-sigma-graph';
import reportWebVitals from './reportWebVitals';
import { CssBaseline } from '@mui/material';

export const createThemeOptions = (darkMode: boolean, language: string): ThemeOptions => ({
  direction: language === 'ar' ? 'rtl' : 'ltr',
  typography: {
    fontSize: 20,
    fontFamily: language === 'ar' ? 'Scheherazade New' : 'Arial',
  },
  palette: {
    primary: {
      main: '#1151BF',
    },
    secondary: {
      main: '#145CD9',
    },
    mode: darkMode ? 'dark' : 'light',
  }
});

export type AppContext = {
  darkMode: boolean
  toggleDarkMode: () => void
  language: string
  setLanguage: (lang: string) => void
  connected: boolean
  setConnected: (connected: boolean) => void
  driver: Driver | null
  setDriver: (driver: Driver | null) => void
  database: string
  setDatabase: (database: string) => void
  username: string
  setUsername: (username: string) => void
  password: string
  setPassword: (password: string) => void
  url: string
  setUrl: (url: string) => void
  sigma: Sigma | null
  setSigma: (sigma: Sigma | null) => void
  theme: Theme
  autologin: boolean
  setAutologin: (autoLogin: boolean) => void
  createDatabaseIndexesAndConstraints: () => Promise<void>
  dropDatabaseIndexesAndConstraints: () => Promise<void>
  search: string
  setSearch: (search: string) => void
  foundNode: string | null
  setFoundNode: (node: string | null) => void
  isFindPath: boolean
  setIsFindPath: (isFindPath: boolean) => void
  startNodeSearch: string
  setStartNodeSearch: (search: string) => void
  startNode: string | null
  setStartNode: (startNode: string | null) => void
  endNodeSearch: string
  setEndNodeSearch: (search: string) => void
  endNode: string | null
  setEndNode: (endNode: string | null) => void
  hoveredNode: string | null
  setHoveredNode: (hoveredNode: string | null) => void
  hoveredNodeLabel: string
  setHoveredNodeLabel: (hoveredNodeLabel: string) => void
  selectedNode: string | null
  setSelectedNode: (selectedNode: string | null) => void
  selectedNodeLabel: string
  setSelectedNodeLabel: (selectedNodeLabel: string) => void
  layoutMode: 'CIRCULAR' | 'RANDOM',
  setLayoutMode: (layoutMode: 'CIRCULAR' | 'RANDOM') => void
}

export const appContext = createContext<AppContext>({
  darkMode: false,
  toggleDarkMode: () => {},
  language: 'en',
  setLanguage: () => {},
  connected: false,
  setConnected: () => {},
  driver: null,
  setDriver: () => {},
  database: '',
  setDatabase: () => {},
  username: '',
  setUsername: () => {},
  password: '',
  setPassword: () => {},
  url: '',
  setUrl: () => {},
  sigma: null,
  setSigma: () => {},
  theme: createTheme(createThemeOptions(false, 'en')),
  autologin: true,
  setAutologin: () => {},
  createDatabaseIndexesAndConstraints: async () => {},
  dropDatabaseIndexesAndConstraints: async () => {},
  search: '',
  setSearch: () => {},
  foundNode: '',
  setFoundNode: () => {},
  isFindPath: false,
  setIsFindPath: () => {},
  startNodeSearch: '',
  setStartNodeSearch: () => {},
  startNode: '',
  setStartNode: () => {},
  endNodeSearch: '',
  setEndNodeSearch: () => {},
  endNode: '',
  setEndNode: () => {},
  hoveredNode: null,
  setHoveredNode: () => {},
  hoveredNodeLabel: '',
  setHoveredNodeLabel: () => {},
  selectedNode: null,
  setSelectedNode: () => {},
  selectedNodeLabel: '',
  setSelectedNodeLabel: () => {},
  layoutMode: 'CIRCULAR',
  setLayoutMode: () => {},
});

const App = () => {
  const localDarkMode = localStorage.getItem('darkMode');
  const localLanguage = localStorage.getItem('language');
  const [darkMode, setDarkMode] = useState(localDarkMode && localDarkMode === '1' ? true : false);
  const [language, setLanguage] = useState(localLanguage ? localLanguage : 'en');
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const [connected, setConnected] = useState(false);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [sigma, setSigma] = useState<Sigma | null>(null);
  const [theme, setTheme] = useState(createTheme(createThemeOptions(darkMode, language)));
  const [autologin, setAutologin] = useState(true);
  const [search, setSearch] = useState('');
  const [foundNode, setFoundNode] = useState<string | null>(null);
  const [isFindPath, setIsFindPath] = useState(false);
  const [startNodeSearch, setStartNodeSearch] = useState('');
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNodeSearch, setEndNodeSearch] = useState('');
  const [endNode, setEndNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredNodeLabel, setHoveredNodeLabel] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState('');
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode ? '1' : '');
    localStorage.setItem('language', language);
    document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr';
    setTheme(createTheme(createThemeOptions(darkMode, language)));
  }, [darkMode, language, setTheme]);
  const [layoutMode, setLayoutMode] = useState<'CIRCULAR' | 'RANDOM'>('CIRCULAR');
  const appContextValue: AppContext = {
    darkMode,
    toggleDarkMode,
    language,
    setLanguage,
    connected,
    setConnected,
    driver,
    setDriver,
    database,
    setDatabase,
    username,
    setUsername,
    password,
    setPassword,
    url,
    setUrl,
    sigma,
    setSigma,
    theme,
    autologin,
    setAutologin,
    createDatabaseIndexesAndConstraints: async () => {
      try {
        await Neo4jSigmaGraph.getInstance().connector.up();
      } catch(__) {}
    },
    dropDatabaseIndexesAndConstraints: async () => {
      try {
        await Neo4jSigmaGraph.getInstance().connector.down();
      } catch(__) {}
    },
    search,
    setSearch,
    foundNode,
    setFoundNode,
    isFindPath,
    setIsFindPath,
    startNodeSearch,
    setStartNodeSearch,
    startNode,
    setStartNode,
    endNodeSearch,
    setEndNodeSearch,
    endNode,
    setEndNode,
    hoveredNode,
    setHoveredNode,
    hoveredNodeLabel,
    setHoveredNodeLabel,
    selectedNode,
    setSelectedNode,
    selectedNodeLabel,
    setSelectedNodeLabel,
    layoutMode,
    setLayoutMode,
  }
  const useStyles = makeStyles({
    snackbarProvider: {
      marginRight: theme.spacing(10),
      marginLeft: theme.spacing(10)
    }
  });
  const classes = useStyles();
  return (
    <appContext.Provider value={appContextValue}>
      <ThemeProvider theme={theme}>
        <RTL>
          <CssBaseline>
            <SnackbarProvider maxSnack={3} classes={{ anchorOriginTopRight: classes.snackbarProvider, anchorOriginTopLeft: classes.snackbarProvider }} anchorOrigin={{ horizontal: language === 'en' ? 'right' : 'left', vertical: 'top' }}>
              <HashRouter basename='/'>
                <Routes>
                  <Route path='/' element={
                    <RestrictedRoute>
                      <SigmaContainer initialSettings={{ defaultNodeType: 'image',  nodeProgramClasses: { image: getNodeProgramImage() } }} style={{ background: 'transparent', direction: 'ltr' }}>
                        <DashboardView />
                      </SigmaContainer>
                    </RestrictedRoute>
                  } />
                  <Route path='/login' element={
                    <AuthRoute>
                      <LoginView />
                    </AuthRoute>
                    } />
                  <Route path='/list' element={
                    <RestrictedRoute>
                      <ListView />
                    </RestrictedRoute>
                  } />
                  <Route path='/print/person/:id' element={
                    <RestrictedRoute>
                      <PersonPrint />
                    </RestrictedRoute>
                  } />
                  <Route path='/edit/person/:id' element={
                    <RestrictedRoute>
                      <PersonEdit />
                    </RestrictedRoute>
                  } />
                </Routes>
              </HashRouter>
            </SnackbarProvider>
          </CssBaseline>
        </RTL>
      </ThemeProvider>
    </appContext.Provider>
  );
}

export default App;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
