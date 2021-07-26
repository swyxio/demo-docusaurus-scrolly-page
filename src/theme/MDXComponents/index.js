/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { isValidElement } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';

import {
  LinkToStacked,
} from "../../react-stacked-pages";

const MyLink = (linkProps) => {
  // console.log({ isinternal: isInternalUrl(linkProps.href), path: linkProps.href, linkProps })
  if (isInternalUrl(linkProps.href)) {
    return (
      <LinkToStacked to={linkProps.href}>
        {linkProps.children}
      </LinkToStacked>
    );
  }
  return <Link {...linkProps} />
};

// https://github.com/facebook/docusaurus/blob/7592982960c0088ad3dad6a53e4691cf63eeba9d/packages/docusaurus/src/client/exports/isInternalUrl.ts
function isInternalUrl(url) {
  function hasProtocol(url) {
    return /^(\w*:|\/\/)/.test(url) === true;
  }
  return typeof url !== 'undefined' && !hasProtocol(url);
}


const MDXComponents = {
  code: (props) => {
    const { children } = props; // For retrocompatibility purposes (pretty rare use case)
    // See https://github.com/facebook/docusaurus/pull/1584

    if (isValidElement(children)) {
      return children;
    }

    return !children.includes('\n') ? (
      <code {...props} />
    ) : (
      <CodeBlock {...props} />
    );
  },
  a: MyLink, // (props) => <Link {...props} />,
  pre: (props) => {
    const { children } = props; // See comment for `code` above

    if (isValidElement(children?.props?.children)) {
      return children?.props.children;
    }

    return (
      <CodeBlock
        {...(isValidElement(children)
          ? children?.props
          : {
            children,
          })}
      />
    );
  },
  h1: Heading('h1'),
  h2: Heading('h2'),
  h3: Heading('h3'),
  h4: Heading('h4'),
  h5: Heading('h5'),
  h6: Heading('h6'),
};
export default MDXComponents;
