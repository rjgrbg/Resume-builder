// pdf-parse v1's package entry point (index.js) has a side-effecting
// "debug mode" check that misfires under Next.js's bundler (see comment in
// src/lib/resume/parser.ts). We import its internal implementation file
// directly instead, which has no published type declarations.
declare module 'pdf-parse/lib/pdf-parse.js' {
  import type { Result, Options } from 'pdf-parse'

  function PDFParse(dataBuffer: Buffer, options?: Options): Promise<Result>

  export default PDFParse
}
