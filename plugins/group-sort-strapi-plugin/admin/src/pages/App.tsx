import { Page } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';

import { HomePage } from './HomePage';
import { Suspense } from 'react';

const App = () => {
  return (
    <Suspense fallback={<Page.Loading />}>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/:uid" element={<HomePage />} />
        <Route path="/:uid/:groupname" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
};

export { App };
