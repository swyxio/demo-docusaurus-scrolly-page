---
sidebar_position: 5
---

# Deploy your site

Docusaurus is a **static-site-generator** (also called **[Jamstack](https://jamstack.org/)**).

It builds your site as simple **static HTML, JavaScript and CSS files**.

> ## More Links
>
> - [Create a Page](/docs/tutorial-basics/create-a-page)
> - [Create a BlogPost](/docs/tutorial-basics/create-a-blog-post)
> - [Create a Document](/docs/tutorial-basics/create-a-document)
> - [Deploy your site](/docs/tutorial-basics/deploy-your-site)
> - [Markdown features](/docs/tutorial-basics/markdown-features) this is an MDX file!

## Build your site

Build your site **for production**:

```bash
npm run build
```

The static files are generated in the `build` folder.

## Deploy your site

Test your production build locally:

```bash
npm run serve
```

The `build` folder is now served at `http://localhost:3000/`.

You can now deploy the `build` folder **almost anywhere** easily, **for free** or very small cost (read the **[Deployment Guide](https://docusaurus.io/docs/deployment)**).
