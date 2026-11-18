// IndexedDB 轻量封装：工程 / 任务 / 提交三个对象仓库
const DB_NAME = 'vet_anim_lab'
const DB_VERSION = 1
const STORES = ['projects', 'assignments', 'submissions']

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode)
    const req = fn(t.objectStore(store))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function dbPut(store, value) {
  const db = await openDB()
  await tx(db, store, 'readwrite', (s) => s.put({ ...value, updatedAt: Date.now() }))
  db.close()
}

export async function dbGet(store, id) {
  const db = await openDB()
  const v = await tx(db, store, 'readonly', (s) => s.get(id))
  db.close()
  return v ?? null
}

export async function dbGetAll(store) {
  const db = await openDB()
  const rows = await tx(db, store, 'readonly', (s) => s.getAll())
  db.close()
  return rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export async function dbDelete(store, id) {
  const db = await openDB()
  await tx(db, store, 'readwrite', (s) => s.delete(id))
  db.close()
}

export async function dbSeedIfEmpty(store, rows) {
  const existing = await dbGetAll(store)
  if (existing.length) return
  for (const row of rows) await dbPut(store, row)
}
