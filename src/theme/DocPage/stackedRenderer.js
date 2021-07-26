import React, { useEffect, useRef, useCallback } from "react";
import renderRoutes from '@docusaurus/renderRoutes';
import {
  useStackedPagesProvider,
  LinkToStacked,
  useStackedPage,
  PageIndexProvider,
  StackedPagesProvider,
} from "../../react-stacked-pages";
import styles from './styles.module.css';
import clsx from 'clsx';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@theme/MDXComponents';

function Page({ children, docRoutes, versionMetadata, ...props }) {
  return <div
    className={clsx(
      'container padding-top--md padding-bottom--lg',
      styles.docItemWrapper,
      // {
      //   [styles.docItemWrapperEnhanced]: hiddenSidebarContainer,
      // },
    )}>
    <h1>{'Page: ' + (props.title || 'Rendered Page')}</h1>
    <pre>{JSON.stringify({ props, docRoutes }, null, 2)}</pre>
    <MDXProvider components={MDXComponents}>
      {renderRoutes(docRoutes, {
        versionMetadata,
      })}
    </MDXProvider>
  </div>
  // return <div className="stacked-page">
  //   {children}
  // </div>
}

const PageContainer = ({ children, slug }) => {
  const [, { overlay, obstructed, highlighted }, i] = useStackedPage();

  return (
    <div
      className={`page-container ${overlay ? "page-container-overlay" : ""} ${obstructed ? "page-container-obstructed" : ""
        }  ${highlighted ? "page-container-highlighted" : ""}`}
      style={{ left: 40 * i, right: -585 }}
    >
      <div className="page-content">{children}</div>
      <LinkToStacked to={slug} className="obstructed-label">
        {slug}
      </LinkToStacked>
    </div>
  );
};

// A wrapper component to render the content of a page when stacked
const StackedPageWrapper = ({ children, slug, i }) => (
  <PageIndexProvider value={i}>
    <PageContainer slug={slug}>{children}</PageContainer>
  </PageIndexProvider>
);

const StackedLayout = ({ data = { swyx: 'rawdata' }, docRoutes, versionMetadata, location, slug = "rawslug" }) => {
  // Use this callback to update what you want to stack.
  // `pageQuery` will be similar to the data prop you get in a Page component.
  // You can return `null` to filter out the page
  const processPageQuery = useCallback((pageQuery) => pageQuery, []);

  const [state, scrollContainer] = useStackedPagesProvider({
    firstPage: { data, slug },
    location,
    processPageQuery,
    pageWidth: 625,
  });

  return (
    <div className="layout">
      <div className="page-columns-scrolling-container" ref={scrollContainer}>
        <div
          className="page-columns-container"
          style={{ width: 625 * (state.stackedPages.length + 1) }}
        >
          <StackedPagesProvider value={state}>
            {/* Render the stacked pages */}
            {state.stackedPages.map((page, i) => (
              <StackedPageWrapper i={i} key={page.slug} slug={page.slug}>
                <Page {...page} docRoutes={docRoutes} versionMetadata={versionMetadata} />
              </StackedPageWrapper>
            ))}
          </StackedPagesProvider>
        </div>
      </div>
    </div>
  );
};

export default StackedLayout;
