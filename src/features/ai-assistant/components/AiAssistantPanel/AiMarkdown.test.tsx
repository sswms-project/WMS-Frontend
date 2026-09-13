import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AiMarkdown, parseAiMarkdown } from './AiMarkdown'

describe('parseAiMarkdown', () => {
  it('splits paragraphs, headings, lists and tables', () => {
    const blocks = parseAiMarkdown(
      [
        '## Tồn kho thấp',
        'Có **2** sản phẩm dưới ngưỡng:',
        '- SKU-001: còn 5',
        '- SKU-002: còn 0',
        '',
        '| SKU | Tồn |',
        '| --- | ---: |',
        '| SKU-001 | 5 |',
        '1. Kiểm tra PO',
        '2. Tạo đơn mua',
      ].join('\n')
    )

    expect(blocks.map((block) => block.kind)).toEqual([
      'heading',
      'paragraph',
      'list',
      'table',
      'list',
    ])
    expect(blocks[4]).toMatchObject({
      kind: 'list',
      ordered: true,
      items: ['Kiểm tra PO', 'Tạo đơn mua'],
    })
  })
})

describe('AiMarkdown', () => {
  it('renders bold text, list items and table cells', () => {
    render(
      <AiMarkdown
        content={[
          'Có **2** sản phẩm',
          '- SKU-001',
          '',
          '| SKU | Tồn |',
          '|---|---|',
          '| A | 5 |',
        ].join('\n')}
      />
    )

    expect(screen.getByText('2').tagName).toBe('STRONG')
    expect(screen.getByRole('listitem')).toHaveTextContent('SKU-001')
    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'SKU' })).toBeInTheDocument()
    expect(within(table).getByRole('cell', { name: '5' })).toBeInTheDocument()
  })

  it('never interprets model output as HTML', () => {
    const { container } = render(<AiMarkdown content={'<img src=x onerror="alert(1)"> xin chào'} />)

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument()
  })
})
