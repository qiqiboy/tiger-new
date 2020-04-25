import { RouteComponentProps } from 'react-router-dom';

export type RouteItem = (
    | {
          component: React.ComponentType;
      }
    | {
          render(routeProps: RouteComponentProps<any>): React.ReactNode;
      }
) & {
    path?: string;
    exact?: boolean;
    routes?: RouteItem[];

    metaData?: {
        keywords?: string[];
        description?: string;
    };
};
