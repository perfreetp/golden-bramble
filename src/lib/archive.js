// IndexedDB 方案档案库:建档编号、版本、变更报告、条件检索
const DB_NAME = 'onsen-facade-archive'
const STORE = 'schemes'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const st = db.createObjectStore(STORE, { keyPath: 'id' })
        st.createIndex('segment', 'segment', { unique: false })
        st.createIndex('floors', 'params.floors', { unique: false })
        st.createIndex('archivedAt', 'archivedAt', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const store = t.objectStore(STORE)
    const out = fn(store)
    t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out)
    t.onerror = () => reject(t.error)
  })
}

export async function saveScheme(record) {
  const db = await openDb()
  await tx(db, 'readwrite', (s) => s.put(record))
  db.close()
  return record
}

export async function allSchemes() {
  const db = await openDb()
  const list = await new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readonly')
    const req = t.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
  db.close()
  return list.sort((a, b) => b.archivedAt - a.archivedAt)
}

export async function deleteScheme(id) {
  const db = await openDb()
  await tx(db, 'readwrite', (s) => s.delete(id))
  db.close()
}

/** 按 街段 / 层数 / 改动时间范围 检索 */
export async function searchSchemes({ segment = '', floors = '', from = '', to = '' } = {}) {
  const all = await allSchemes()
  const fromTs = from ? new Date(from + 'T00:00:00').getTime() : null
  const toTs = to ? new Date(to + 'T23:59:59').getTime() : null
  return all.filter((r) => {
    if (segment && !String(r.segment).includes(segment)) return false
    if (floors !== '' && r.params.floors !== Number(floors)) return false
    if (fromTs && r.archivedAt < fromTs) return false
    if (toTs && r.archivedAt > toTs) return false
    return true
  })
}

export function makeArchiveId(seq, when = Date.now()) {
  const d = new Date(when)
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `TH-${ymd}-${String(seq).padStart(3, '0')}`
}
