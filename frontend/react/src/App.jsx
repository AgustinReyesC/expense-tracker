import { useState, useContext, createContext, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://193.122.171.45:5001/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

///─── AuthContext ───────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) setUser(JSON.parse(stored))
    setReady(true)
  }, [])

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext)

///─── ProtectedRoute — guarda location para redirigir después del login ────────

function ProtectedRoute({ children }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return null
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

///─── Skeleton para estado de carga ────────────────────────────────────────────

function SkeletonCard() {
  const base = {
    background: 'var(--border)',
    borderRadius: 2,
    animation: 'pulse 1.4s ease-in-out infinite',
  }
  return (
    <div style={{ ...styles.card, display: 'flex', gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...base, height: 14, width: '55%' }} />
        <div style={{ ...base, height: 12, width: '30%' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div style={{ ...base, height: 26, width: 60 }} />
          <div style={{ ...base, height: 26, width: 60 }} />
        </div>
      </div>
      <div style={{ ...base, height: 22, width: 70, alignSelf: 'flex-start' }} />
    </div>
  )
}

///─── Componentes reutilizables ─────────────────────────────────────────────────

function TextFieldTexto({ id, label, type = 'text', value, onChange, placeholder, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <div style={styles.fieldError}>{error}</div>}
    </div>
  )
}

function TextFieldContra({ id, label, value, onChange, placeholder, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <div style={styles.fieldError}>{error}</div>}
    </div>
  )
}

function CardGenerica({ children, style }) {
  return (
    <div style={{ ...styles.card, ...style }}>
      {children}
    </div>
  )
}

function CardGasto({ gasto, onEdit, onDelete }) {
  return (
    <CardGenerica style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-h)', marginBottom: 2 }}>
          {gasto.description}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={styles.badge}>{gasto.category}</span>
          {gasto.receipt && <a href={gasto.receipt.replace('/upload/', '/upload/fl_attachment/')} target="_blank">📎 ver comprobante</a>}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={() => onEdit(gasto)} style={{ ...styles.btnSm, ...styles.btnOutline }}>
            editar
          </button>
          <button onClick={() => onDelete(gasto._id)} style={{ ...styles.btnSm, background: '#e24b4a', color: '#fff', border: 'none' }}>
            eliminar
          </button>
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-h)', whiteSpace: 'nowrap' }}>
        ${Number(gasto.amount).toLocaleString('es-MX')}
      </div>
    </CardGenerica>
  )
}

///─── DropZone con validación de tipo y tamaño ─────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE_MB = 5

function DropZone({ file, onChange }) {
  const [over, setOver] = useState(false)
  const [fileError, setFileError] = useState('')

  const validate = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('solo se permiten imágenes (jpg, png, webp) o PDF')
      return false
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`el archivo no puede superar ${MAX_SIZE_MB}MB`)
      return false
    }
    setFileError('')
    return true
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setOver(false)
    const f = e.dataTransfer.files[0]
    if (f && validate(f)) onChange(f)
  }

  const handleSelect = (e) => {
    const f = e.target.files[0]
    if (f && validate(f)) onChange(f)
  }

  ///vista previa si el archivo es imagen
  const preview = file instanceof File && file.type.startsWith('image/')
    ? URL.createObjectURL(file)
    : null

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        style={{
          border: `1.5px dashed ${over ? 'var(--accent)' : 'var(--border)'}`,
          background: over ? 'var(--accent-bg)' : 'var(--bg)',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          fontSize: 13,
          color: 'var(--text)',
          transition: 'border-color .15s',
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 6 }}>⬆</div>
        <div>arrastra un archivo o haz clic para seleccionar</div>
        <div style={{ fontSize: 11, color: 'var(--text)', marginTop: 4 }}>jpg, png, webp, pdf — máx {MAX_SIZE_MB}MB</div>
        {file && !preview && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
            📎 {file.name ?? file}
          </div>
        )}
        <input
          id="file-input"
          type="file"
          style={{ display: 'none' }}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleSelect}
        />
      </div>
      {preview && (
        <img
          src={preview}
          alt="vista previa"
          style={{ marginTop: 8, maxHeight: 120, maxWidth: '100%', objectFit: 'contain', border: '1px solid var(--border)' }}
        />
      )}
      {fileError && <div style={styles.fieldError}>{fileError}</div>}
    </div>
  )
}

///─── Modal de gasto con errores por campo ──────────────────────────────────────

function GastoModal({ gasto, onClose, onSave }) {
  const [description, setDescription] = useState(gasto?.description ?? '')
  const [amount, setAmount]           = useState(gasto?.amount ?? '')
  const [category, setCategory]       = useState(gasto?.category ?? 'Comida')
  const [file, setFile]               = useState(gasto?.receipt ?? null)
  const [error, setError]             = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading]         = useState(false)

  const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar', 'Otro']

  const validate = () => {
    const errs = {}
    if (!description.trim()) errs.description = 'el concepto es obligatorio'
    if (!amount || Number(amount) <= 0) errs.amount = 'ingresa un monto válido'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('description', description)
      formData.append('amount', amount)
      formData.append('category', category)
      if (file instanceof File) formData.append('receipt', file)

      let saved
      if (gasto?._id) {
        const res = await api.put(`/expenses/${gasto._id}`, formData)
        saved = res.data
      } else {
        const res = await api.post('/expenses', formData)
        saved = res.data
      }
      onSave(saved, !!gasto)
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.modalBg} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={styles.modal}>
        <h2 style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-h)', marginBottom: 20 }}>
          {gasto ? 'editar gasto' : 'nuevo gasto'}
        </h2>

        {error && <div style={styles.error}>{error}</div>}

        <TextFieldTexto
          id="m-desc" label="concepto" value={description}
          onChange={(e) => setDescription(e.target.value)} placeholder="ej. gasolina"
          error={fieldErrors.description}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextFieldTexto
            id="m-amount" label="monto" type="number" value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
            error={fieldErrors.amount}
          />
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="m-cat" style={styles.label}>categoría</label>
            <select id="m-cat" value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={styles.label}>comprobante</label>
          <DropZone file={file} onChange={setFile} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ ...styles.btn, ...styles.btnOutline, flex: 1 }}>
            cancelar
          </button>
          <button onClick={handleSave} disabled={loading} style={{ ...styles.btn, flex: 1, opacity: loading ? .6 : 1 }}>
            {loading ? 'guardando...' : 'guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

///─── Login — redirige a la página original después de autenticar ───────────────

function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname ?? '/home'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('completa todos los campos'); return }
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.accessToken, data.refreshToken, data.user)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e.response?.data?.message ?? 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>iniciar sesión</h1>
      <p style={styles.subtitle}>ingresa tus credenciales para continuar</p>

      {error && <div style={styles.error}>{error}</div>}

      <TextFieldTexto id="l-email" label="correo" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
      <TextFieldContra id="l-pass" label="contraseña" value={password}
        onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

      <button onClick={handleLogin} disabled={loading} style={{ ...styles.btn, opacity: loading ? .6 : 1 }}>
        {loading ? 'entrando...' : 'entrar'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, marginTop: 16, color: 'var(--text)' }}>
        ¿no tienes cuenta? <Link to="/register" style={{ color: 'var(--accent)' }}>regístrate</Link>
      </p>
    </div>
  )
}

function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading]   = useState(false)

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'el nombre es obligatorio'
    if (!email.trim()) errs.email = 'el correo es obligatorio'
    if (password.length < 8) errs.password = 'mínimo 8 caracteres'
    if (password !== confirm) errs.confirm = 'las contraseñas no coinciden'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      login(data.accessToken, data.refreshToken, data.user)
      navigate('/home')
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>crear cuenta</h1>
      <p style={styles.subtitle}>llena los campos para registrarte</p>

      {error && <div style={styles.error}>{error}</div>}

      <TextFieldTexto id="r-name" label="nombre" value={name}
        onChange={(e) => setName(e.target.value)} placeholder="tu nombre" error={fieldErrors.name} />
      <TextFieldTexto id="r-email" label="correo" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" error={fieldErrors.email} />
      <TextFieldContra id="r-pass" label="contraseña" value={password}
        onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 8 caracteres" error={fieldErrors.password} />
      <TextFieldContra id="r-pass2" label="confirmar contraseña" value={confirm}
        onChange={(e) => setConfirm(e.target.value)} placeholder="repite tu contraseña" error={fieldErrors.confirm} />

      <button onClick={handleRegister} disabled={loading} style={{ ...styles.btn, opacity: loading ? .6 : 1 }}>
        {loading ? 'creando cuenta...' : 'crear cuenta'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, marginTop: 16, color: 'var(--text)' }}>
        ¿ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent)' }}>inicia sesión</Link>
      </p>
    </div>
  )
}

///─── Home con skeletons, empty state y botón reintentar ───────────────────────

function Home() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const [gastos, setGastos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchGastos()
  }, [])

  const fetchGastos = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/expenses')
      setGastos(data.expenses)
    } catch (e) {
      setError('Error al cargar los gastos')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setGastos(prev => prev.map(g => g._id === saved._id ? saved : g))
    } else {
      setGastos(prev => [saved, ...prev])
    }
    setModal(false)
    setEditing(null)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`)
      setGastos(prev => prev.filter(g => g._id !== id))
    } catch {
      setError('Error al eliminar')
    }
  }

  const handleEdit = (gasto) => {
    setEditing(gasto)
    setModal(true)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderContent = () => {
    if (loading) {
      ///skeletons mientras carga
      return [1, 2, 3].map(i => <SkeletonCard key={i} />)
    }
    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ ...styles.error, display: 'inline-block', marginBottom: 12 }}>{error}</div>
          <br />
          <button onClick={fetchGastos} style={{ ...styles.btn, width: 'auto', padding: '8px 20px' }}>
            reintentar
          </button>
        </div>
      )
    }
    if (gastos.length === 0) {
      ///empty state
      return (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-h)', marginBottom: 6 }}>sin gastos aún</div>
          <div style={{ fontSize: 13 }}>agrega tu primer gasto con el botón de arriba</div>
        </div>
      )
    }
    return gastos.map(g => (
      <CardGasto key={g._id} gasto={g} onEdit={handleEdit} onDelete={handleDelete} />
    ))
  }

  return (
    <div style={{ ...styles.page, maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={styles.h1}>mis gastos</h1>
          <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>
            bienvenido, <strong style={{ color: 'var(--text-h)' }}>{user?.name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={() => { setEditing(null); setModal(true) }} style={{ ...styles.btn, ...styles.btnOutline, width: 'auto', padding: '8px 16px' }}>
            + nuevo gasto
          </button>
          <button onClick={handleLogout} style={{ ...styles.btn, ...styles.btnOutline, width: 'auto', padding: '8px 16px' }}>
            salir
          </button>
        </div>
      </div>

      {renderContent()}

      {modal && (
        <GastoModal
          gasto={editing}
          onClose={() => { setModal(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

const styles = {
  page: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '40px 24px',
  },
  h1: {
    fontSize: 28,
    fontWeight: 500,
    color: 'var(--text-h)',
    letterSpacing: '-0.5px',
    marginBottom: 4,
     marginLeft: 16,
    marginRight: 16,
  },
  subtitle: {
    color: 'var(--text)',
    fontSize: 14,
    marginBottom: 28,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-h)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    font: '14px system-ui',
    outline: 'none',
    borderRadius: 0,
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#e24b4a',
  },
  fieldError: {
    fontSize: 12,
    color: '#a32d2d',
    marginTop: 4,
  },
  btn: {
    width: '100%',
    padding: '10px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    marginTop: 8,
  },
  btnOutline: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-h)',
  },
  btnSm: {
    padding: '5px 12px',
    fontSize: 12,
    cursor: 'pointer',
    borderRadius: 0,
    marginTop: 0,
  },
  card: {
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    padding: '20px',
    marginBottom: 12,
    boxShadow: 'var(--shadow)',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 500,
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    border: '1px solid var(--accent-border)',
  },
  error: {
    background: 'rgba(226,75,74,.1)',
    border: '1px solid rgba(226,75,74,.4)',
    color: '#a32d2d',
    fontSize: 13,
    padding: '10px 12px',
    marginBottom: 16,
  },
  modalBg: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modal: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    padding: 24,
    width: '100%',
    maxWidth: 440,
    boxShadow: 'var(--shadow)',
    borderRadius: 0,
  },
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home"     element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="*"         element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}