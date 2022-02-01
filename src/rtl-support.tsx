import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { appContext } from './App';
import { useContext } from 'react';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
});

export const RTL: React.FC = (props) => {
  const { language } = useContext(appContext);
  return (
    <CacheProvider value={language === 'en' ? cacheLtr : cacheRtl}>
      {props.children}
    </CacheProvider>
  );
}
