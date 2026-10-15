import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

test('Home page renders the main heading', () => {
  render(<Home />)
  expect(
    screen.getByRole('heading', { level: 1, name: /To get started, edit the/ }),
  ).toBeDefined()
})
