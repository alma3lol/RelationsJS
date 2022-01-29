import './App.css';
import './i18nextConf';
import { useEffect, useState, createContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Driver, Session } from 'neo4j-driver';
import { ThemeProvider } from '@emotion/react';
import { createTheme, CssBaseline, Theme, ThemeOptions } from '@mui/material';
import Sigma from 'sigma';
import { SnackbarProvider } from 'notistack';
import { SigmaContainer } from 'react-sigma-v2';
import 'react-sigma-v2/lib/react-sigma-v2.css';
import getNodeProgramImage from 'sigma/rendering/webgl/programs/node.image';
import { AuthRoute, RestrictedRoute } from './components';
import { LoginView } from './views';
import { DashboardView } from './views/dashboard.view';
import { RTL } from './rtl-support';

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
  createDatabaseIndexesAndConstraints: (session: Session) => Promise<void>
  dropDatabaseIndexesAndConstraints: (session: Session) => Promise<void>
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
    createDatabaseIndexesAndConstraints: async (session: Session) => {
      try {
        const txc = session.beginTransaction();
        await txc.run('CREATE INDEX category_name IF NOT EXISTS FOR (n:Category) ON (n.name)');
        await txc.run('CREATE INDEX person_arabicName IF NOT EXISTS FOR (n:Person) ON (n.arabicName)');
        await txc.run('CREATE INDEX person_englishName IF NOT EXISTS FOR (n:Person) ON (n.englishName)');
        await txc.run('CREATE INDEX person_motherName IF NOT EXISTS FOR (n:Person) ON (n.motherName)');
        await txc.run('CREATE INDEX person_nickname IF NOT EXISTS FOR (n:Person) ON (n.nickname)');
        await txc.run('CREATE INDEX person_address IF NOT EXISTS FOR (n:Person) ON (n.address)');
        await txc.run('CREATE INDEX person_notes IF NOT EXISTS FOR (n:Person) ON (n.notes)');
        await txc.run('CREATE INDEX nationality_name IF NOT EXISTS FOR (n:Nationality) ON (n.name)');
        await txc.run('CREATE INDEX media_path IF NOT EXISTS FOR (n:Media) ON (n.path)');
        await txc.run('CREATE INDEX media_name IF NOT EXISTS FOR (n:Media) ON (n.name)');
        await txc.run('CREATE INDEX media_type IF NOT EXISTS FOR (n:Media) ON (n.type)');
        await txc.commit();
        await session.close();
      } catch(__) {}
    },
    dropDatabaseIndexesAndConstraints: async (session: Session) => {
      try {
        const txc = session.beginTransaction();
        await txc.run('DROP INDEX category_name IF EXISTS');
        await txc.run('DROP INDEX person_arabicName IF EXISTS');
        await txc.run('DROP INDEX person_englishName IF EXISTS');
        await txc.run('DROP INDEX person_motherName IF EXISTS');
        await txc.run('DROP INDEX person_nickname IF EXISTS');
        await txc.run('DROP INDEX person_address IF EXISTS');
        await txc.run('DROP INDEX person_notes IF EXISTS');
        await txc.run('DROP INDEX nationality_name IF EXISTS');
        await txc.run('DROP INDEX media_path IF EXISTS');
        await txc.run('DROP INDEX media_name IF EXISTS');
        await txc.run('DROP INDEX media_type IF EXISTS');
        await txc.commit();
        await session.close();
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
