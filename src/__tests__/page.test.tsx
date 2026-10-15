import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// タスク取得（Supabase）は応答待ちのままにして、同期的に描画される部分だけを検証する
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => new Promise(() => {})),
}))

test('Home page renders the main heading and a loading message while tasks load', () => {
  render(<Home />)
  expect(
    screen.getByRole('heading', { level: 1, name: 'タスクカンバン' }),
  ).toBeDefined()
  expect(screen.getByText('読み込み中…')).toBeDefined()
})
