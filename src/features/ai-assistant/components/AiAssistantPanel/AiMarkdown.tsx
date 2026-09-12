import { Fragment, type ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type MarkdownBlock =
  | { readonly kind: 'paragraph'; readonly lines: readonly string[] }
  | { readonly kind: 'heading'; readonly text: string }
  | { readonly kind: 'list'; readonly ordered: boolean; readonly items: readonly string[] }
  | {
      readonly kind: 'table'
      readonly header: readonly string[]
      readonly rows: readonly (readonly string[])[]
    }

const BULLET_ITEM = /^\s*[-*•]\s+(.*)$/
const ORDERED_ITEM = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+(.*)$/
const TABLE_ROW = /^\s*\|.*\|\s*$/
const TABLE_SEPARATOR = /^\s*\|?(\s*:?-{2,}:?\s*\|)+\s*(:?-{2,}:?\s*)?\|?\s*$/
const INLINE_TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isBlockStart(line: string): boolean {
  return (
    TABLE_ROW.test(line) || BULLET_ITEM.test(line) || ORDERED_ITEM.test(line) || HEADING.test(line)
  )
}

/**
 * Parses the small markdown subset the assistant is instructed to use (paragraphs, headings,
 * lists, tables, bold, inline code). Output is plain data rendered as React elements — model text
 * is never injected as HTML.
 */
export function parseAiMarkdown(text: string): MarkdownBlock[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ''
    if (!line.trim()) {
      index += 1
      continue
    }

    if (TABLE_ROW.test(line) && TABLE_SEPARATOR.test(lines[index + 1] ?? '')) {
      const header = splitTableRow(line)
      const rows: string[][] = []
      index += 2
      while (index < lines.length && TABLE_ROW.test(lines[index] ?? '')) {
        rows.push(splitTableRow(lines[index] ?? ''))
        index += 1
      }
      blocks.push({ kind: 'table', header, rows })
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      blocks.push({ kind: 'heading', text: heading[1] ?? '' })
      index += 1
      continue
    }

    const ordered = !BULLET_ITEM.test(line) && ORDERED_ITEM.test(line)
    if (ordered || BULLET_ITEM.test(line)) {
      const pattern = ordered ? ORDERED_ITEM : BULLET_ITEM
      const items: string[] = []
      let match = pattern.exec(lines[index] ?? '')
      while (match) {
        items.push(match[1] ?? '')
        index += 1
        match = index < lines.length ? pattern.exec(lines[index] ?? '') : null
      }
      blocks.push({ kind: 'list', ordered, items })
      continue
    }

    const paragraph: string[] = []
    while (index < lines.length) {
      const current = lines[index] ?? ''
      if (!current.trim() || isBlockStart(current)) break
      paragraph.push(current)
      index += 1
    }
    if (paragraph.length === 0) {
      // A table-looking row without a separator line: show it as text.
      paragraph.push(line)
      index += 1
    }
    blocks.push({ kind: 'paragraph', lines: paragraph })
  }

  return blocks
}

function renderInline(text: string): ReactNode[] {
  return text
    .split(INLINE_TOKEN)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-muted rounded-sm px-1 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        )
      }
      return <Fragment key={index}>{part}</Fragment>
    })
}

function MarkdownBlockView({ block }: { readonly block: MarkdownBlock }) {
  switch (block.kind) {
    case 'heading':
      return <p className="font-semibold">{renderInline(block.text)}</p>
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag
          className={block.ordered ? 'list-decimal space-y-0.5 pl-4' : 'list-disc space-y-0.5 pl-4'}
        >
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ListTag>
      )
    }
    case 'table':
      return (
        <div className="bg-card overflow-x-auto rounded-md border">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                {block.header.map((cell, index) => (
                  <TableHead key={index} className="h-8 px-2 whitespace-nowrap">
                    {renderInline(cell)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="px-2 py-1.5">
                      {renderInline(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    case 'paragraph':
      return (
        <p className="leading-relaxed">
          {block.lines.map((line, index) => (
            <Fragment key={index}>
              {index > 0 ? <br /> : null}
              {renderInline(line)}
            </Fragment>
          ))}
        </p>
      )
  }
}

interface AiMarkdownProps {
  readonly content: string
}

export function AiMarkdown({ content }: AiMarkdownProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2 text-sm break-words">
      {parseAiMarkdown(content).map((block, index) => (
        <MarkdownBlockView key={index} block={block} />
      ))}
    </div>
  )
}
