export type ServiceResult<T> = Promise<T>

export type BackendAdapter<TRecord extends { id: string }> = {
  list: () => ServiceResult<TRecord[]>
  get: (id: string) => ServiceResult<TRecord | undefined>
  create: (record: TRecord) => ServiceResult<TRecord>
  update: (id: string, patch: Partial<TRecord>) => ServiceResult<TRecord>
  delete: (id: string) => ServiceResult<{ id: string; deleted: true }>
}

export function createMockAdapter<TRecord extends { id: string }>(seed: TRecord[], label: string): BackendAdapter<TRecord> {
  let records = [...seed]
  return {
    async list() { return records },
    async get(id) { return records.find((record) => record.id === id) },
    async create(record) { records = [record, ...records]; return record },
    async update(id, patch) {
      const current = records.find((record) => record.id === id)
      if (!current) throw new Error(`${label} record not found: ${id}`)
      const updated = { ...current, ...patch }
      records = records.map((record) => record.id === id ? updated : record)
      return updated
    },
    async delete(id) {
      records = records.filter((record) => record.id !== id)
      return { id, deleted: true }
    },
  }
}
