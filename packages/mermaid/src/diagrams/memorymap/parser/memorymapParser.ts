import { createToken, CstParser, EOF, Lexer } from 'chevrotain';
import type { CstNode, IToken } from 'chevrotain';
import type { MemoryMap, MemoryNode, SourceLocation } from '../memorymapTypes.js';
import { parseStyle } from '../memorymapStyle.js';

const Space = createToken({ name: 'Space', pattern: / +/ });
const Newline = createToken({ name: 'Newline', pattern: /\r\n|\n|\r/, line_breaks: true });
const Quoted = createToken({ name: 'Quoted', pattern: /"(?:[^\n\r"\\]|\\[^\n\r])*"/ });
const Comment = createToken({ name: 'Comment', pattern: /%%[^\n\r]*/ });
const Header = createToken({ name: 'Header', pattern: /memorymap-beta\b/ });
const Keyword = createToken({
  name: 'Keyword',
  pattern: /(?:group|section|label|noteStyle|note|style)\b/,
});
const Metadata = createToken({
  name: 'Metadata',
  pattern: /accDescr *{[^}]*}|(?:accTitle|accDescr):[^\n\r]*/,
  line_breaks: true,
});
const Word = createToken({ name: 'Word', pattern: /[^\s"]+/ });
const tokens = [Space, Newline, Quoted, Comment, Header, Keyword, Metadata, Word];
const lexer = new Lexer(tokens);

class MemoryParser extends CstParser {
  constructor() {
    super(tokens, { nodeLocationTracking: 'full' });
    this.performSelfAnalysis();
  }

  start = this.RULE('start', () => {
    this.MANY(() => this.SUBRULE(this.line));
    this.CONSUME(EOF);
  });

  line = this.RULE('line', () => {
    this.OPTION(() => this.CONSUME(Space));
    this.OPTION2(() =>
      this.OR([
        { ALT: () => this.SUBRULE(this.header) },
        { ALT: () => this.SUBRULE(this.statement) },
        { ALT: () => this.CONSUME(Metadata) },
        { ALT: () => this.CONSUME(Comment) },
      ])
    );
    this.OPTION3(() => this.CONSUME2(Space));
    this.CONSUME(Newline);
  });

  header = this.RULE('header', () => {
    this.CONSUME(Header);
    this.OPTION({
      GATE: () => this.LA(1).tokenType === Space && this.LA(2).tokenType === Word,
      DEF: () => {
        this.CONSUME(Space);
        this.CONSUME(Word);
      },
    });
  });

  statement = this.RULE('statement', () => {
    this.CONSUME(Keyword);
    this.OPTION({
      GATE: () => this.LA(1).tokenType === Space && this.LA(2).tokenType === Quoted,
      DEF: () => {
        this.CONSUME(Space);
        this.CONSUME(Quoted);
      },
    });
  });
}

const grammar = new MemoryParser();
interface Statement extends SourceLocation {
  kind: string;
  indent: number;
  value?: string;
}
interface LineContext {
  Space?: IToken[];
  header?: CstNode[];
  statement?: CstNode[];
  Metadata?: IToken[];
}

const diagnostic = (source: string, location: SourceLocation, message: string): Error =>
  new Error(
    `Memorymap: ${message} at body line ${location.line}, column ${location.column}\n` +
      `${source.split(/\r\n|\n|\r/)[location.line - 1] ?? ''}\n${' '.repeat(location.column - 1)}^`
  );

class Visitor extends grammar.getBaseCstVisitorConstructorWithDefaults() {
  statements: Statement[] = [];
  private indent = 0;

  constructor(private source: string) {
    super();
    this.validateVisitor();
  }

  start(ctx: { line: CstNode[] }): void {
    for (const line of ctx.line ?? []) {
      this.visit(line);
    }
  }

  line(ctx: LineContext): void {
    this.indent = ctx.Space?.[0]?.startColumn === 1 ? ctx.Space[0].image.length : 0;
    if (ctx.header) {
      this.visit(ctx.header);
    } else if (ctx.statement) {
      this.visit(ctx.statement);
    } else if (ctx.Metadata) {
      const token = ctx.Metadata[0];
      const block =
        token.image.startsWith('accDescr') &&
        token.image.includes('{') &&
        !token.image.startsWith('accDescr:');
      this.add(
        token.image.startsWith('accTitle:') ? 'accTitle' : 'accDescription',
        token,
        block
          ? token.image.slice(token.image.indexOf('{') + 1, -1).trim()
          : token.image.slice(token.image.indexOf(':') + 1).trim()
      );
    }
  }

  header(ctx: { Header: IToken[]; Word?: IToken[] }): void {
    this.add('header', ctx.Header[0], ctx.Word?.[0].image ?? 'vertical');
  }

  statement(ctx: { Keyword: IToken[]; Quoted?: IToken[] }): void {
    let value: string | undefined;
    if (ctx.Quoted) {
      try {
        value = JSON.parse(ctx.Quoted[0].image) as string;
      } catch {
        throw diagnostic(
          this.source,
          this.location(ctx.Quoted[0]),
          'Invalid JSON string or escape'
        );
      }
    }
    this.add(ctx.Keyword[0].image, ctx.Keyword[0], value);
  }

  private location(token: IToken): SourceLocation {
    return { line: token.startLine ?? 1, column: token.startColumn ?? 1 };
  }

  private add(kind: string, token: IToken, value?: string): void {
    this.statements.push({ kind, value, indent: this.indent, ...this.location(token) });
  }
}

export const parseMemoryMap = (source: string): MemoryMap => {
  const input = source.endsWith('\n') ? source : `${source}\n`;
  const lexed = lexer.tokenize(input);
  if (lexed.errors.length) {
    const error = lexed.errors[0];
    throw diagnostic(
      source,
      { line: error.line ?? 1, column: error.column ?? 1 },
      'Unexpected character; use spaces for indentation and quoted JSON strings'
    );
  }
  grammar.input = lexed.tokens;
  const cst = grammar.start();
  if (grammar.errors.length) {
    const { token, message } = grammar.errors[0];
    throw diagnostic(
      source,
      { line: token.startLine ?? input.split('\n').length, column: token.startColumn ?? 1 },
      message
    );
  }
  const visitor = new Visitor(source);
  visitor.visit(cst);
  const [header, ...statements] = visitor.statements;
  function fail(location: SourceLocation, message: string): never {
    throw diagnostic(source, location, message);
  }
  if (!header || header.kind !== 'header') {
    fail(header ?? { line: 1, column: 1 }, 'Expected memorymap-beta header');
  }
  if (header.value !== 'vertical' && header.value !== 'horizontal') {
    fail(header, 'Orientation must be vertical or horizontal');
  }
  const model: MemoryMap = {
    orientation: header.value,
    groups: [],
    accTitle: '',
    accDescription: '',
  };
  const stack: { node: MemoryNode; indent: number; childIndent?: number }[] = [];
  const properties = new Map<MemoryNode, Set<string>>();
  const metadata = new Set<string>();
  let baseline: number | undefined;
  let sequence = 0;

  for (const statement of statements) {
    const { kind, value, indent } = statement;
    if (kind === 'header') {
      fail(statement, 'Duplicate memorymap header');
    }
    if (kind === 'group' || kind === 'accTitle' || kind === 'accDescription') {
      baseline ??= indent;
      if (indent !== baseline) {
        fail(statement, `${kind} must be at the root baseline`);
      }
      if (kind !== 'group') {
        if (metadata.has(kind)) {
          fail(statement, `Duplicate ${kind}`);
        }
        metadata.add(kind);
        model[kind] = value ?? '';
        stack.length = 0;
        continue;
      }
    }
    if (kind === 'group' || kind === 'section') {
      if (kind === 'group' && !value?.trim()) {
        fail(statement, 'A group requires a nonblank quoted entry label'); // cspell:ignore nonblank
      }
      const node: MemoryNode = {
        id: `memorymap-${sequence++}`,
        kind,
        content: kind === 'section' ? (value ?? '') : '',
        ...(kind === 'group' ? { label: value } : {}),
        children: [],
        style: {},
        noteStyle: {},
        location: { line: statement.line, column: statement.column },
      };
      properties.set(node, new Set());
      if (kind === 'group') {
        stack.length = 0;
        model.groups.push(node);
      } else {
        owner(statement).children.push(node);
      }
      stack.push({ node, indent });
    } else {
      const node = owner(statement);
      const seen = properties.get(node)!;
      if (seen.has(kind)) {
        fail(statement, `Duplicate ${kind} on ${node.kind}`);
      }
      seen.add(kind);
      if (value === undefined) {
        fail(statement, `${kind} requires a quoted JSON string`);
      }
      if (kind === 'label' || kind === 'note') {
        if (kind === 'label' && node.kind === 'group') {
          fail(statement, 'A group entry label belongs on its declaration');
        }
        node[kind] = value;
      } else if (kind === 'style' || kind === 'noteStyle') {
        try {
          node[kind] = parseStyle(value, kind === 'noteStyle' ? 'note' : node.kind);
        } catch (error) {
          fail(statement, error instanceof Error ? error.message : String(error));
        }
      } else {
        fail(statement, `Unknown statement ${kind}`);
      }
    }
  }
  if (!model.groups.length) {
    fail(header, 'A memorymap requires at least one group');
  }
  for (const [node, seen] of properties) {
    if (node.kind === 'group' && !node.children.length) {
      fail(node.location, 'A group requires at least one section');
    }
    if (seen.has('noteStyle') && node.note === undefined) {
      fail(node.location, 'noteStyle requires a note on the same owner');
    }
  }
  return model;

  function owner(statement: Statement): MemoryNode {
    while (stack.length && statement.indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    if (!parent) {
      return fail(statement, 'Sections and properties require a containing group or section');
    }
    parent.childIndent ??= statement.indent;
    if (parent.childIndent !== statement.indent) {
      fail(
        statement,
        'Inconsistent indentation; siblings must align and indentation must return to an established level'
      );
    }
    return parent.node;
  }
};
