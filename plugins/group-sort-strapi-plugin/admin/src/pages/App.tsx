import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';

import { WelcomePage } from './WelcomePage';
import { Suspense } from 'react';
import ArrangePage from './ArrangePage';

const App = () => {
  return (
    <Suspense fallback={<Page.Loading />}>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route path="/:uid" element={<WelcomePage />} />
        <Route path="/:uid/:groupField/:groupName" element={<ArrangePage />} />
      </Routes>
    </Suspense>
  );
};

export { App };
