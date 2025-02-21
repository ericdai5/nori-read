# Nori

This project was developed in the Fall of 2024 as a final project for CIS 7000 (Interactive Reading), an advanced seminar in human-centered computing at Penn. 

I built Nori, an augmented reading and authoring interface designed to provide just-in-time overviews of data-table references. You can read a presentation for this project at [this link](https://www.figma.com/proto/EgYdSyMKGR1Ype1L0CklP7/Nori?page-id=303%3A2&node-id=303-7&viewport=1176%2C418%2C0.11&t=783EQNEu3UGCkwhx-1&scaling=contain&content-scaling=fixed).

Nori leverages large language models (LLMs) to generate color-coded annotations highlighting key insights to bridge the gap between textual references and data tables while ensuring context preservation and fostering human-interface collaboration.

As of the current time of completion of this paper, Nori is a system that is only accessible in the local development environment. A live demo of the system can be found here. The system’s front-end architecture utilizes TypeScript and Next.js.

The block editor that Nori is built on comes from an open-source provider called [TipTap](https://tiptap.dev/product/editor), which specializes in providing extensible block editor templates that are built with [ProseMirror](https://prosemirror.net/), which is a toolkit for building WYSIWYG-style editing interfaces for the web. 

The capability for table processing and analysis of textual highlights comes from OpenAI’s GPT-4 (chatgpt-4-0125-preview) model.

## Installation & Usage

```bash
# Install the project dependencies
npm install
```

```bash
# Launch the development server
npm run dev
```

Please add an .env.local file with an OpenAI API Key in the following style
```bash
NEXT_PUBLIC_OPENAI_API_KEY= *add OpenAI API Key here*
```

