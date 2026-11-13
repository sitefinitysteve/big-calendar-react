import { describe, expect, it } from 'vitest'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { createEventSchema } from '@/calendar/schemas'
import type { TEventFormData } from '@/calendar/schemas'
import { DEFAULT_LABELS } from '@/calendar/labels'

const labels = {
  ...DEFAULT_LABELS,
  validationTitleRequired: 'Titre requis',
  validationStartDateRequired: 'Date de début requise',
  validationColorRequired: 'Couleur requise',
  validationStartAfterEnd: 'Début après la fin',
}

async function resolve(values: Record<string, unknown>) {
  const resolver = zodResolver(createEventSchema(labels)) as unknown as Resolver<TEventFormData>
  return resolver(values as TEventFormData, undefined, { fields: {}, shouldUseNativeValidation: false })
}

describe('createEventSchema through zodResolver', () => {
  it('reports the localized label for each missing field, not zod default copy', async () => {
    const { errors } = await resolve({ user: 'u1', title: '', description: 'd', isAllDay: false })
    expect(errors.title?.message).toBe('Titre requis')
    expect(errors.startDate?.message).toBe('Date de début requise')
    expect(errors.color?.message).toBe('Couleur requise')
  })

  it('reports the start-after-end refinement on startDate', async () => {
    const day = new Date(2026, 10, 13)
    const { errors } = await resolve({
      user: 'u1',
      title: 't',
      description: 'd',
      isAllDay: false,
      startDate: day,
      startTime: { hour: 10, minute: 0 },
      endDate: day,
      endTime: { hour: 9, minute: 0 },
      color: 'blue',
    })
    expect(errors.startDate?.message).toBe('Début après la fin')
  })

  it('accepts a valid event', async () => {
    const day = new Date(2026, 10, 13)
    const { errors, values } = await resolve({
      user: 'u1',
      title: 't',
      description: 'd',
      isAllDay: true,
      startDate: day,
      endDate: day,
      color: 'green',
    })
    expect(errors).toEqual({})
    expect(values).toMatchObject({ title: 't', color: 'green' })
  })
})
