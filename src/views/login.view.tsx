import {
  Grid,
  FormControl,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  Button,
  Paper,
  useTheme,
  IconButton,
  AlertTitle,
  Alert,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  VisibilityOff as VisibilityOffIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { DefaultTheme, makeStyles } from '@mui/styles';
import { auth, driver, Neo4jError } from 'neo4j-driver';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTitle } from 'react-use';
import { appContext } from '../App';
import { ThemeModeSwitch } from '../components';
import { useTranslation } from 'react-i18next';
import { Neo4jSigmaGraph } from '../neo4j-sigma-graph';
import Graph from 'graphology';
import { usePersonContextMenu } from '../models';
import { CategoryRepository, MediaRepository, PersonRepository } from '../repositories';
import { useCategoryContextMenu, useMediaContextMenu } from '../menus';

const useStyles = makeStyles<DefaultTheme, { mode: 'dark' | 'light' }>({
  input: {
    color: ({ mode }) => mode === 'dark' ? '#fff !important' : '#000 !important'
  }
});

export const LoginView = () => {
  const { t } = useTranslation();
  useTitle(t('titles.login'));
  const { darkMode, toggleDarkMode, setConnected, setDriver, setDatabase, setUsername, setPassword, setUrl, autologin, setAutologin } = useContext(appContext);
  const [localUrl, localUsername, localPassword, localDatabase] = [localStorage.getItem('neo4j_url'), localStorage.getItem('neo4j_username'), localStorage.getItem('neo4j_password'), localStorage.getItem('neo4j_database')]
  const [url, setLocalUrl] = useState(!!localUrl ? localUrl : 'neo4j://localhost:7687');
  const [username, setLocalUsername] = useState(!!localUsername ? localUsername : 'neo4j');
  const [password, setLocalPassword] = useState(!!localPassword ? localPassword : '');
  const [database, setLocalDatabase] = useState(!!localDatabase ? localDatabase : 'neo4j');
  const [error, setError] = useState('');
  useEffect(() => {
    localStorage.setItem('neo4j_url', url);
    localStorage.setItem('neo4j_username', username);
    localStorage.setItem('neo4j_password', password);
    localStorage.setItem('neo4j_database', database);
  }, [url, username, password, database]);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const darkClasses = useStyles({ mode: 'dark' });
  const lightClasses = useStyles({ mode: 'light' });
  const [classes, setClasses] = useState(darkMode ? darkClasses : lightClasses);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setClasses(darkMode ? darkClasses : lightClasses);
  }, [darkMode, darkClasses, lightClasses]);
  const categoryContextMenu = useCategoryContextMenu();
  const personContextMenu = usePersonContextMenu();
  const mediaContextMenu = useMediaContextMenu();
  const handleOnSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const drv = driver(url, auth.basic(username, password));
      await drv.verifyConnectivity({ database });
      setDatabase(database);
      setUsername(username);
      setPassword(password);
      setUrl(url);
      setDriver(drv);
      setLoading(false);
      Neo4jSigmaGraph.init(new Graph(), drv, { database }, t);
      Neo4jSigmaGraph.getInstance().setRepository('CATEGORY', new CategoryRepository(drv, { database }));
      Neo4jSigmaGraph.getInstance().setRepository('PERSON', new PersonRepository(drv, { database }));
      Neo4jSigmaGraph.getInstance().setRepository('MEDIA', new MediaRepository(drv, { database }));
      Neo4jSigmaGraph.getInstance().setContextMenu('CATEGORY', categoryContextMenu);
      Neo4jSigmaGraph.getInstance().setContextMenu('PERSON', personContextMenu);
      Neo4jSigmaGraph.getInstance().setContextMenu('MEDIA', mediaContextMenu);
      setConnected(true);
    } catch (err: any) {
      const typedError: Neo4jError = err || new Neo4jError('Invalid credentials', '403');
      setError(typedError.message);
      setLoading(false);
      setTimeout(() => setError(''), 5000);
    }
  }
  const handleOnSubmitCallback = useCallback(handleOnSubmit, [
    setLoading,
    setDriver,
    setConnected,
    setError,
    database,
    setDatabase,
    url,
    username,
    password,
    setPassword,
    setUrl,
    setUsername,
    categoryContextMenu,
    personContextMenu,
    mediaContextMenu,
  ]);
  useEffect(() => {
    if (autologin) {
      setAutologin(false);
      const e: any = { preventDefault: () => {} };
      handleOnSubmitCallback(e);
    }
  }, [handleOnSubmitCallback, autologin, setAutologin]);
  return (
    <Grid
      container
      spacing={0}
      direction='column'
      alignItems='center'
      justifyContent='center'
      style={{ minHeight: '100vh' }}>
        <Paper style={{ padding: theme.spacing(3), maxWidth: 700 }} elevation={3}>
          <form onSubmit={handleOnSubmit}>
            <Grid container spacing={3}>
            <Grid container item xs={12} alignItems='center' direction='column' justifyContent='center'>
            <ThemeModeSwitch onClick={toggleDarkMode} checked={darkMode} />
            </Grid>
            <Grid item xs={12}>
            <Collapse in={!!error}>
            <Alert severity="error">
            <AlertTitle>{t('error')}</AlertTitle>
            {error}
            </Alert>
            </Collapse>
            </Grid>
            <Grid item xs={12}>
            <FormControl required fullWidth variant="outlined">
            <InputLabel htmlFor="url">{t('neo4j_url')}</InputLabel>
            <OutlinedInput
            inputProps={{ className: classes.input }}
            value={url}
            id="url"
            label={t('neo4j_url')}
            onChange={e => setLocalUrl(e.target.value)}
            />
            </FormControl>
            </Grid>
            <Grid container item xs={12} spacing={3}>
            <Grid item xs={6}>
            <FormControl required fullWidth variant="outlined">
            <InputLabel htmlFor="username">{t('username')}</InputLabel>
            <OutlinedInput
            inputProps={{ className: classes.input }}
            value={username}
            id="username"
            label={t('username')}
            onChange={e => setLocalUsername(e.target.value)}
            />
            </FormControl>
            </Grid>
              <Grid item xs={6}>
                <FormControl required fullWidth variant="outlined">
                  <InputLabel htmlFor="password">{t('password')}</InputLabel>
                  <OutlinedInput
                    inputProps={{ className: classes.input }}
                      value={password}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      onChange={e => setLocalPassword(e.target.value)}
                      endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                    edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    </InputAdornment>
                    }
                    label={t('password')}
                    />
                </FormControl>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormControl required fullWidth variant="outlined">
                <InputLabel htmlFor="database">{t('database')}</InputLabel>
                <OutlinedInput
                  inputProps={{ className: classes.input }}
                  value={database}
                  id="database"
                  label={t('database')}
                  onChange={e => setLocalDatabase(e.target.value)}
                  />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button disabled={loading} fullWidth type='submit' variant='contained'>{loading ? <CircularProgress /> : t('login') }</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Grid>
  )
}
