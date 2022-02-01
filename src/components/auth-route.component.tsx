import { ReactNode, useContext } from 'react';
import { Navigate, useLocation} from 'react-router-dom';
import { appContext } from '../App';

export const AuthRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const state = location.state as { from: string };
  const { connected } = useContext(appContext);
  if (connected) {
    if (state && state.from !== "/logout") return <Navigate to={state.from} />
      else return <Navigate to='/' />;
  }
  else return <>{children}</>;
}
