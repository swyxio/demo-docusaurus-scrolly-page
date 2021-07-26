// https://github.com/mathieudutour/gatsby-digital-garden/tree/master/packages/react-stacked-pages-hook/src

import React, {
  createContext,

  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from "react";
import qs from "querystring";
import throttle from "lodash.throttle";
import equal from "lodash.isequal";

// // stub out gatsby stuff
// import { Link, withPrefix } from "gatsby";
// import { navigate, withPrefix } from "gatsby";
import Link from '@docusaurus/Link';
import { useHistory } from "react-router-dom";
function withPrefix(string) {
  return string;
}
function navigate(history, string) {
  // cannot useHistory because rules of hooks
  history.push(string);
}


// // https://github.com/mathieudutour/gatsby-digital-garden/blob/master/packages/react-stacked-pages-hook/src/Link.tsx
export const LinkToStacked = React.forwardRef(
  (
    {
      to,
      onClick,
      onMouseLeave,
      onMouseEnter,
      ...restProps
    },
    ref
  ) => {
    const [
      ,
      ,
      ,
      navigateToStackedPage,
      highlightStackedPage,
    ] = useStackedPage();
    const onClickHandler = useCallback(
      (ev) => {
        ev.preventDefault();
        if (onClick) {
          onClick(ev);
        }
        if (ev.metaKey || ev.ctrlKey) {
          window.open(withPrefix(to), "_blank");
        } else {
          navigateToStackedPage(to);
        }
      },
      [navigateToStackedPage, to, onClick]
    );

    const onMouseEnterHandler = useCallback(
      (ev) => {
        highlightStackedPage(to, true);
        if (onMouseEnter) {
          onMouseEnter(ev);
        }
      },
      [to, onMouseEnter, highlightStackedPage]
    );

    const onMouseLeaveHandler = useCallback(
      (ev) => {
        highlightStackedPage(to, false);
        if (onMouseLeave) {
          onMouseLeave(ev);
        }
      },
      [to, onMouseLeave, highlightStackedPage]
    );

    return (
      <Link
        {...restProps}
        to={to /*
        // @ts-ignore */}
        ref={ref}
        onClick={onClickHandler}
        onMouseEnter={onMouseEnterHandler}
        onMouseLeave={onMouseLeaveHandler}
      />
    );
  }
);

// https://github.com/mathieudutour/gatsby-digital-garden/blob/master/packages/react-stacked-pages-hook/src/contexts.ts
export const StackedPagesContext = createContext({
  stackedPages: [],
  stackedPageStates: {},
  navigateToStackedPage: () => { },
  highlightStackedPage: () => { },
});

export const StackedPagesIndexContext = createContext(0);

export const StackedPagesProvider = StackedPagesContext.Provider;
export const PageIndexProvider = StackedPagesIndexContext.Provider;

// https://github.com/mathieudutour/gatsby-digital-garden/blob/master/packages/react-stacked-pages-hook/src/hooks.tsx
const throttleTime = 16;
const obstructedOffset = 120;

function useScroll() {
  const containerRef = useRef(null);
  const [scroll, setScroll] = useState(0);
  const [width, setWidth] = useState(0);

  const scrollObserver = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    setScroll(containerRef.current.scrollLeft);
    setWidth(containerRef.current.getBoundingClientRect().width);
  }, [setScroll, setWidth, containerRef]);

  const throttledScrollObserver = throttle(scrollObserver, throttleTime);

  const setRef = useCallback((node) => {
    if (node) {
      // When the ref is first set (after mounting)
      node.addEventListener("scroll", throttledScrollObserver);
      containerRef.current = node;
      window.addEventListener("resize", throttledScrollObserver);
      throttledScrollObserver(); // initialization
    } else if (containerRef.current) {
      // When unmounting
      containerRef.current.removeEventListener(
        "scroll",
        throttledScrollObserver
      );
      window.removeEventListener("resize", throttledScrollObserver);
    }
  }, []);

  return [scroll, width, setRef, containerRef]
}

function getRoot(
  firstPage, // ?: { data: any; slug: string },
  processPageQuery // ?: (queryResult: any, slug: string) => T | null
) //: { slug: string; data: T }[] 
{
  return firstPage
    ? [
      processPageQuery
        ? {
          data: processPageQuery(firstPage.data, firstPage.slug),
          slug: firstPage.slug,
        }
        : firstPage,
    ]
    : [];
}

export function useStackedPagesProvider({
  location,
  processPageQuery,
  firstPage,
  pageWidth = 625,
  obstructedPageWidth = 40,
}
  // : {
  //   location: Location;
  //   processPageQuery?: (queryResult: any, slug: string) => T | null;
  //   firstPage?: { data: any; slug: string };
  //   pageWidth?: number;
  //   obstructedPageWidth?: number;
  // }
) {
  const previousFirstPage = useRef(firstPage);
  const [scroll, containerWidth, setRef, containerRef] = useScroll();
  const [stackedPages, setStackedPages] = useState(
    // <{ slug: string; data: T }[]>
    getRoot(firstPage, processPageQuery)
  );
  const [stackedPageStates, setStackedPageStates] = useState(
    firstPage
      ? {
        [firstPage.slug]: {
          obstructed: false,
          highlighted: false,
          overlay: scroll > pageWidth - obstructedOffset,
          active: true,
        },
      }
      : {}
  );

  const stackedPagesSlugs = useMemo(() => {
    console.log({ location })
    const res = qs.parse(location.search.replace(/^\?/, "")).stackedPages || [];
    if (typeof res === "string") {
      return [res];
    }
    return res;
  }, [location]);

  useEffect(() => {
    if (equal(firstPage, previousFirstPage.current)) {
      return;
    }
    setStackedPages((pages) => {
      return getRoot(firstPage, processPageQuery).concat(
        previousFirstPage.current ? pages.slice(1) : pages
      );
    });
    previousFirstPage.current = firstPage;
  }, [firstPage, processPageQuery, setStackedPages]);

  useEffect(() => {
    Promise.all(
      // // hook into the internals of Gatsby to dynamically fetch the notes
      // stackedPagesSlugs.map((slug) => window.___loader.loadPage(slug))
      stackedPagesSlugs.map((slug) => console.log('loading page', slug) || {
        json: {
          data: {
            slug,
            swyxmockdata: 'TODO: this is mock data'
          }
        }
      })
    ).then((data) =>
      setStackedPages(
        getRoot(firstPage, processPageQuery).concat(
          // filter out 404s
          data
            .map((x, i) => ({
              slug: stackedPagesSlugs[i],
              data: processPageQuery
                ? processPageQuery(x.json.data, stackedPagesSlugs[i])
                : x,
            }))
            .filter((x) => x.data)
        )
      )
    );
  }, [stackedPagesSlugs]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        left: pageWidth * (stackedPages.length + 1),
        behavior: "smooth",
      });
    }
  }, [stackedPages, containerRef]);

  // on scroll or on new page
  useEffect(() => {
    const acc = {}; // : ScrollState

    if (!containerRef.current) {
      setStackedPageStates(
        stackedPages.reduce((prev, x, i, a) => {
          prev[x.slug] = {
            overlay: true,
            obstructed: false,
            highlighted: false,
            active: i === a.length - 1,
          };
          return prev;
        }, acc)
      );
      return;
    }

    setStackedPageStates(
      stackedPages.reduce((prev, x, i, a) => {
        prev[x.slug] = {
          highlighted: false,
          overlay:
            scroll >
            Math.max(
              pageWidth * (i - 1) - (obstructedPageWidth * i - 2),
              0
            ) || scroll < Math.max(0, pageWidth * (i - 2)),
          obstructed:
            scroll >
            Math.max(
              pageWidth * (i + 1) -
              obstructedOffset -
              obstructedPageWidth * (i - 1),
              0
            ) || scroll + containerWidth < pageWidth * i + obstructedOffset,
          active: i === a.length - 1,
        };
        return prev;
      }, acc)
    );
  }, [stackedPages, containerRef, scroll, setStackedPageStates]);

  let history = useHistory();
  const navigateToStackedPage = useCallback(
    // (to: string, index: number = 0) => {
    (to, index = 0) => {
      const existingPage = stackedPages.findIndex((x) => x.slug === to);
      if (existingPage !== -1 && containerRef && containerRef.current) {
        setStackedPageStates((stackedPageStates) => {
          if (!stackedPageStates[to]) {
            return stackedPageStates;
          }
          return Object.keys(stackedPageStates).reduce((prev, slug) => {
            prev[slug] = {
              ...stackedPageStates[slug],
              highlighted: false,
              active: slug === to,
            };
            return prev;
          }, {}); //  as ScrollState
        });
        containerRef.current.scrollTo({
          top: 0,
          left:
            pageWidth * existingPage - (obstructedPageWidth * existingPage - 1),
          behavior: "smooth",
        });
        return;
      }
      // console.log('window.location', window.location);
      const search = qs.parse(window.location.search.replace(/^\?/, ""));
      search.stackedPages = stackedPages
        .slice(1, index + 1)
        .map((x) => x.slug)
        .concat(to);

      navigate(history,
        `${window.location.pathname.replace(
          withPrefix("/"),
          "/"
        )}?${qs.stringify(search)}`.replace(/^\/\//, "/")
      );
    },
    [stackedPages, setStackedPageStates]
  );

  const highlightStackedPage = useCallback(
    // (slug: string, highlighted?: boolean) => {
    (slug, highlighted) => {
      setStackedPageStates((stackedPageStates) => {
        if (!stackedPageStates[slug]) {
          return stackedPageStates;
        }
        return {
          ...stackedPageStates,
          [slug]: {
            ...stackedPageStates[slug],
            highlighted:
              typeof highlighted !== "undefined"
                ? highlighted
                : !stackedPageStates[slug].highlighted,
          },
        };
      });
    },
    [setStackedPageStates]
  );

  const contextValue = useMemo(
    () => ({
      stackedPages,
      navigateToStackedPage,
      highlightStackedPage,
      stackedPageStates,
    }),
    [
      stackedPages,
      navigateToStackedPage,
      highlightStackedPage,
      stackedPageStates,
    ]
  );

  return [contextValue, setRef];
}

export function useStackedPages() {
  const {
    stackedPages,
    stackedPageStates,
    navigateToStackedPage,
    highlightStackedPage,
  } = useContext(StackedPagesContext);
  const index = useContext(StackedPagesIndexContext);

  const hookedNavigateToStackedPage = useCallback(
    // (to: string) => navigateToStackedPage(to, index),
    (to) => navigateToStackedPage(to, index),
    [navigateToStackedPage, index]
  );

  return [
    stackedPages,
    stackedPageStates,
    hookedNavigateToStackedPage,
    highlightStackedPage,
  ] // as const;
}

export function useStackedPage() {
  const {
    stackedPages,
    stackedPageStates,
    navigateToStackedPage,
    highlightStackedPage,
  } = useContext(StackedPagesContext);
  const index = useContext(StackedPagesIndexContext);

  const hookedNavigateToStackedPage = useCallback(
    // (to: string) => navigateToStackedPage(to, index),
    (to) => navigateToStackedPage(to, index),
    [navigateToStackedPage, index]
  );

  const currentPage = stackedPages[index];

  console.log({ stackedPageStates, currentPage });
  return [
    currentPage,
    currentPage ? stackedPageStates[currentPage.slug] : {},
    index,
    hookedNavigateToStackedPage,
    highlightStackedPage,
  ]// as const;
}